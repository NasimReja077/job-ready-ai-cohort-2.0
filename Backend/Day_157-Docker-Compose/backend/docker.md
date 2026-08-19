# Docker Commands & Concepts

This document explains the Dockerfile, the `docker-compose.yml`, and the Docker CLI commands used in this project.

---

## 1. Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY . /app

CMD ["node", "server.js"]
```

A Dockerfile is a set of instructions used to build a **Docker image** — a blueprint for a container.

| Instruction | What it does |
|---|---|
| `FROM node:20-alpine` | Sets the base image. `node:20-alpine` is Node.js v20 running on Alpine Linux (a very small Linux distro), which keeps the final image lightweight. |
| `WORKDIR /app` | Sets `/app` as the working directory inside the container. All following instructions (`COPY`, `RUN`, `CMD`) run relative to this path. It's created automatically if it doesn't exist. |
| `COPY package.json /app` | Copies `package.json` from your project (on your machine) into `/app` inside the image. |
| `COPY package-lock.json /app` | Copies `package-lock.json` too, so `npm install` produces the exact same dependency versions every time. |
| `RUN npm install` | Executes `npm install` **during the image build**, installing all dependencies into `node_modules` inside the image. |
| `COPY . /app` | Copies the rest of the project files (source code) into `/app`. |
| `CMD ["node", "server.js"]` | The **default command** that runs when a container starts from this image. Unlike `RUN`, this does not execute at build time — it executes every time the container starts. |

### Why copy `package.json` before the rest of the code?

This is a caching optimization. Docker builds images in layers, and caches each layer. If you copy the whole project first and *then* run `npm install`, any code change (even a single-line edit) invalidates the cache and forces a full reinstall of dependencies. By copying only `package.json`/`package-lock.json` first and running `npm install`, that layer only gets rebuilt when your dependencies actually change — not on every code change. This significantly speeds up rebuilds.

---

## 2. docker-compose.yml

```dockercompose
services:
  backend:
    build: ./Backend
    ports:
      - "8080:3000"
    volumes:
      - ./Backend:/app
      - backend_node_modules:/app/node_modules
    command: npx nodemon -L server.js

volumes:
  backend_node_modules:
```

Docker Compose lets you define and run multi-container (or single-container) applications using a single YAML file, instead of typing long `docker build`/`docker run` commands manually.

| Key | What it does |
|---|---|
| `services:` | Defines the containers that make up your application. Here there's one service, named `backend`. |
| `build: ./Backend` | Tells Compose to build the image from the Dockerfile found in the `./Backend` folder (instead of pulling a pre-built image). |
| `ports: "8080:3000"` | Maps port `8080` on your **host machine** to port `3000` **inside the container** (the port Express listens on). So you visit `localhost:8080`, and it's forwarded to port `3000` inside the container. |
| `volumes:` | Mounts folders/data between host and container (explained below). |
| `command: npx nodemon -L server.js` | Overrides the Dockerfile's `CMD`. Instead of running `node server.js`, it runs `nodemon` with the `-L` (legacy watch/polling) flag, so the server auto-restarts whenever a source file changes — useful for development. |
| `volumes: backend_node_modules:` (bottom) | Declares `backend_node_modules` as a **named volume**, managed by Docker itself. |

### The two volume mounts, explained

```yaml
volumes:
  - ./Backend:/app
  - backend_node_modules:/app/node_modules
```

- **`./Backend:/app`** — a **bind mount**. It links your local `./Backend` folder directly to `/app` in the container. Any change you make to your code on your host machine is instantly reflected inside the container (this is what makes `nodemon` live-reloading useful — no rebuild needed for code changes).

- **`backend_node_modules:/app/node_modules`** — a **named volume**, specifically for `node_modules`. This is needed because of a conflict: the bind mount above (`./Backend:/app`) would otherwise overwrite the container's `/app/node_modules` (which was installed during the image build) with your host's `./Backend/node_modules` — which may be empty, missing, or built for the wrong OS/architecture (Alpine Linux vs. your Windows/Mac/Linux host). By mounting a separate named volume specifically at `/app/node_modules`, it "shadows" that folder and keeps the container's own correctly-installed dependencies intact, while everything else in `/app` still syncs with your host.

In short: **code stays synced live, but `node_modules` stays isolated and safe inside the container.**

---

## 3. Docker CLI Commands

### Image commands

```bash
docker build . -t cohort-class
```
Builds a Docker image from the Dockerfile in the current directory (`.`). The `-t cohort-class` flag **tags** (names) the image `cohort-class` so it's easy to reference later instead of using its long image ID.

```bash
docker rmi <image-id or image-name>
```
Removes (deletes) a Docker image from your local machine. You can't remove an image that's currently in use by a container unless you stop/remove that container first (or use `-f` to force it).

### Container commands

```bash
docker run cohort-class
```
Creates and starts a **new container** from the `cohort-class` image. Common flags you'll often add:
- `-d` → run in detached mode (background)
- `-p 8080:3000` → map ports (same idea as the `ports:` key in Compose)
- `--name mycontainer` → give the container a custom name
- `-v ./Backend:/app` → mount volumes

```bash
docker ps
```
Lists all **currently running** containers, showing container ID, image, status, ports, and name. Add `-a` (`docker ps -a`) to see **all** containers, including stopped ones.

```bash
docker stop <container-id or container-name>
```
Gracefully stops a running container (sends a `SIGTERM`, then `SIGKILL` if it doesn't stop in time). The container still exists afterward — it's just not running.

```bash
docker rm <container-id or container-name>
```
Removes (deletes) a stopped container permanently. A running container must be stopped first, or you can force it with `docker rm -f <container>`.

---

## 4. Docker Compose Commands

Since this project uses `docker-compose.yml`, these are the commands you'll actually use day-to-day instead of the raw `docker build`/`docker run` commands above:

```bash
docker compose up
```
Builds (if needed) and starts **all services** defined in `docker-compose.yml`. Add `--build` to force a rebuild of images, and `-d` to run in detached (background) mode.

```bash
docker compose down
```
Stops and removes all containers created by `docker compose up`. Add `-v` to also remove named volumes (like `backend_node_modules`) — useful if you want a completely clean slate.

```bash
docker compose ps
```
Lists the containers managed by this Compose project and their status.

```bash
docker compose logs -f backend
```
Streams (follows, `-f`) the logs of the `backend` service — helpful for watching `nodemon` restart on file changes or debugging errors.

```bash
docker compose exec backend sh
```
Opens an interactive shell **inside** the running `backend` container — useful for poking around, checking files, or running one-off commands like `npm ls`.

---

## 5. Quick Recap: What Actually Happens

1. `docker compose up` reads `docker-compose.yml`.
2. It builds an image from `./Backend/Dockerfile` (Node 20 Alpine base → copies `package.json` → `npm install` → copies rest of code).
3. It starts a container from that image, named per the `backend` service.
4. It mounts your local `./Backend` folder into `/app` so code edits are live, while keeping `node_modules` isolated in a separate named volume.
5. Instead of running `node server.js` (the Dockerfile's default `CMD`), it runs `npx nodemon -L server.js` (overridden by Compose's `command:`), so the server restarts automatically on file changes.
6. Port `3000` inside the container (where Express listens) is exposed on port `8080` on your machine, so you access the API at `http://localhost:8080`.