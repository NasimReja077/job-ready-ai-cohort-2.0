Yes. This is a **client-side pagination** implementation in React. The main idea is:

> **Fetch all products → calculate which products belong to the current page → use `slice()` to display only those products → generate page buttons → change `currentPage` when a button is clicked.**

There are also a couple of small issues in your code that I'll point out.

---

# 1. Complete flow

Suppose the API returns **30 products** and you want **5 products per page**.

Then:

```text
Total Products = 30
Products Per Page = 5

Pages = 30 / 5 = 6
```

So your UI becomes:

```text
[1] [2] [3] [4] [5] [6]
```

When page `2` is clicked:

```text
currentPage = 2

Start index = (2 × 5) - 5 = 5
End index   = 2 × 5 = 10

products.slice(5, 10)
```

So products with indexes `5` through `9` are displayed.

---

# 2. Your state

```js
const [postData, setPostData] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [postParPage, setPostPerPage] = useState(5);
```

You have **3 pieces of state**.

### `postData`

```js
const [postData, setPostData] = useState([]);
```

Stores all products received from the API.

Initially:

```js
[]
```

After API request:

```js
[
  { id: 1, title: "..." },
  { id: 2, title: "..." },
  { id: 3, title: "..." },
  ...
]
```

---

### `currentPage`

```js
const [currentPage, setCurrentPage] = useState(1);
```

Stores which page the user is currently viewing.

Initially:

```text
currentPage = 1
```

When user clicks page 3:

```js
setCurrentPage(3);
```

Now:

```text
currentPage = 3
```

React re-renders the component.

---

### `postParPage`

```js
const [postParPage, setPostPerPage] = useState(5);
```

This means:

> Show 5 products on each page.

You could later make this dynamic:

```text
5
10
20
```

For example:

```jsx
<select
  value={postParPage}
  onChange={(e) => setPostPerPage(Number(e.target.value))}
>
  <option value={5}>5</option>
  <option value={10}>10</option>
  <option value={20}>20</option>
</select>
```

---

# 3. Fetching the data

You have:

```js
const fetchData = async () => {
  const res = await axios.get("https://dummyjson.com/products");

  setPostData(res.data.products || []);
};
```

The API response looks approximately like:

```js
{
  products: [
    {
      id: 1,
      title: "Essence Mascara Lash Princess"
    },
    {
      id: 2,
      title: "Eyeshadow Palette"
    },
    ...
  ],
  total: 194,
  skip: 0,
  limit: 30
}
```

You take:

```js
res.data.products
```

and store it:

```js
setPostData(res.data.products || []);
```

So:

```text
API
 ↓
res.data.products
 ↓
postData
 ↓
pagination
 ↓
currentPost
 ↓
UI
```

---

# 4. Why use `useEffect()`?

```js
useEffect(() => {
  fetchData();
}, []);
```

The empty dependency array:

```js
[]
```

means:

> Run this effect after the component's initial render.

So the flow is:

```text
App renders
   ↓
useEffect runs
   ↓
fetchData()
   ↓
Axios API request
   ↓
API returns products
   ↓
setPostData()
   ↓
React re-renders
```

---

# 5. The most important part: pagination calculation

You have:

```js
const lastPostIndex = currentPage * postParPage;

const firstPostIndex = lastPostIndex - postParPage;
```

This is the heart of your pagination.

Let's understand it carefully.

Assume:

```js
postParPage = 5;
```

---

## Page 1

```js
currentPage = 1;
```

### Last index

```js
1 * 5 = 5
```

So:

```js
lastPostIndex = 5
```

### First index

```js
5 - 5 = 0
```

So:

```js
firstPostIndex = 0
```

Therefore:

```js
postData.slice(0, 5)
```

You get:

```text
Index:  0  1  2  3  4
        ↓  ↓  ↓  ↓  ↓
        1  2  3  4  5
```

Page 1 displays products 1–5.

---

# 6. Page 2

User clicks:

```text
[2]
```

This executes:

```js
setCurrentPage(2)
```

React changes:

```js
currentPage = 2
```

Now:

```js
lastPostIndex = 2 * 5;
```

Result:

```js
lastPostIndex = 10;
```

Then:

```js
firstPostIndex = 10 - 5;
```

Result:

```js
firstPostIndex = 5;
```

Therefore:

```js
postData.slice(5, 10)
```

Remember:

> `slice(start, end)` includes `start` but excludes `end`.

So:

```text
slice(5, 10)

Indexes:
5  6  7  8  9
↓  ↓  ↓  ↓  ↓
6  7  8  9  10
```

Page 2 displays products **6–10**.

---

# 7. Page 3

```js
currentPage = 3
```

Calculate:

```js
lastPostIndex = 3 * 5;
```

```text
15
```

Then:

```js
firstPostIndex = 15 - 5;
```

```text
10
```

Therefore:

```js
postData.slice(10, 15)
```

Products:

```text
11  12  13  14  15
```

---

# 8. General formula

This is the formula you should remember for client-side pagination:

```js
const lastIndex = currentPage * itemsPerPage;

const firstIndex = lastIndex - itemsPerPage;
```

Then:

```js
const currentItems = data.slice(firstIndex, lastIndex);
```

In mathematical form:

```text
firstIndex = (currentPage - 1) × itemsPerPage

lastIndex = currentPage × itemsPerPage
```

For example:

| Page | Items/Page | First Index | Last Index | slice          |
| ---: | ---------: | ----------: | ---------: | -------------- |
|    1 |          5 |           0 |          5 | `slice(0,5)`   |
|    2 |          5 |           5 |         10 | `slice(5,10)`  |
|    3 |          5 |          10 |         15 | `slice(10,15)` |
|    4 |          5 |          15 |         20 | `slice(15,20)` |
|    5 |          5 |          20 |         25 | `slice(20,25)` |

---

# 9. Your `currentPost`

You have:

```js
const currentPost = postData.slice(
  firstPostIndex,
  lastPostIndex
);
```

This means:

> Take only the products that belong to the current page.

For example, if:

```js
postData.length = 20;
currentPage = 2;
postParPage = 5;
```

Then:

```js
firstPostIndex = 5;
lastPostIndex = 10;
```

Therefore:

```js
currentPost = postData.slice(5, 10);
```

Your full `postData` might be:

```text
[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
```

`currentPost` becomes:

```text
[6,7,8,9,10]
```

Only these are rendered.

---

# 10. Rendering the products

You have:

```jsx
{currentPost.map((item) => (
  <div key={item.id}>
    {item.title}
  </div>
))}
```

React loops through only `currentPost`.

For page 1:

```text
currentPost
     ↓
[Product 1, Product 2, Product 3, Product 4, Product 5]
     ↓
map()
     ↓
UI
```

For page 2:

```text
currentPost
     ↓
[Product 6, Product 7, Product 8, Product 9, Product 10]
     ↓
map()
     ↓
UI
```

---

# 11. Now your `PaginationButton`

Your component receives:

```jsx
<PaginationButton
  totalPost={postData.length}
  postPerPage={postParPage}
  setCurrentPage={setCurrentPage}
/>
```

So it gets three values:

```js
totalPost
postPerPage
setCurrentPage
```

---

# 12. `totalPost`

Suppose API gives you:

```js
30 products
```

Then:

```js
postData.length
```

is:

```text
30
```

Therefore:

```jsx
totalPost={30}
```

---

# 13. `postPerPage`

You have:

```js
postParPage = 5;
```

So:

```jsx
postPerPage={5}
```

---

# 14. Calculating number of pages

This is very important:

```js
Math.ceil(totalPost / postPerPage)
```

Suppose:

```text
totalPost = 30
postPerPage = 5
```

Then:

```js
30 / 5 = 6
```

So:

```js
Math.ceil(6)
```

is:

```text
6
```

Therefore you need:

```text
6 pages
```

---

## What if there are 32 products?

```js
32 / 5
```

Result:

```text
6.4
```

You cannot have 6.4 pages.

So:

```js
Math.ceil(6.4)
```

becomes:

```text
7
```

Therefore:

```text
32 products
5 per page

Page 1 → 1-5
Page 2 → 6-10
Page 3 → 11-15
Page 4 → 16-20
Page 5 → 21-25
Page 6 → 26-30
Page 7 → 31-32
```

This is why `Math.ceil()` is used.

---

# 15. Creating the pages array

You have:

```js
let pages = [];

for (
  let i = 1;
  i <= Math.ceil(totalPost / postPerPage);
  i++
) {
  pages.push(i);
}
```

Suppose:

```js
totalPost = 30;
postPerPage = 5;
```

Then:

```js
Math.ceil(30 / 5)
```

is:

```text
6
```

The loop becomes:

```js
for (let i = 1; i <= 6; i++)
```

Iterations:

```text
i = 1 → pages.push(1)
i = 2 → pages.push(2)
i = 3 → pages.push(3)
i = 4 → pages.push(4)
i = 5 → pages.push(5)
i = 6 → pages.push(6)
```

So:

```js
pages = [1, 2, 3, 4, 5, 6]
```

---

# 16. Rendering page buttons

Then:

```jsx
{pages.map((page) => (
  <button
    key={page}
    onClick={() => setCurrentPage(page)}
  >
    {page}
  </button>
))}
```

Because:

```js
pages = [1,2,3,4,5,6]
```

React creates:

```html
<button>1</button>
<button>2</button>
<button>3</button>
<button>4</button>
<button>5</button>
<button>6</button>
```

---

# 17. What happens when you click page 3?

This line is extremely important:

```jsx
onClick={() => setCurrentPage(page)}
```

Suppose:

```js
page = 3;
```

Clicking button 3 executes:

```js
setCurrentPage(3);
```

React updates:

```js
currentPage = 3;
```

Then the component re-renders.

Now:

```js
lastPostIndex = 3 * 5;
```

```text
15
```

And:

```js
firstPostIndex = 15 - 5;
```

```text
10
```

Then:

```js
currentPost = postData.slice(10, 15);
```

So products 11–15 appear.

---

# 18. Complete flow

Think about your application like this:

```text
              API
               │
               ▼
       axios.get(...)
               │
               ▼
        res.data.products
               │
               ▼
          postData[]
               │
               │
               ▼
       ┌─────────────────┐
       │ Pagination Logic │
       └─────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
currentPage        postPerPage
       │                │
       └───────┬────────┘
               ▼
        Calculate indexes
               │
               ▼
        firstIndex
        lastIndex
               │
               ▼
        postData.slice()
               │
               ▼
          currentPost
               │
               ▼
             map()
               │
               ▼
             UI
```

And separately:

```text
totalPost
    │
    ▼
totalPost / postPerPage
    │
    ▼
Math.ceil()
    │
    ▼
[1,2,3,4,5,6]
    │
    ▼
Pagination Buttons
    │
    ▼
User clicks button
    │
    ▼
setCurrentPage()
    │
    ▼
React re-render
    │
    ▼
New slice()
    │
    ▼
New products
```

---

# 19. One correction in your code

Your Axios URL appears as:

```js
axios.get("[https://dummyjson.com/products](https://dummyjson.com/products)")
```

That is Markdown formatting and **should not be in JavaScript**.

Use:

```js
axios.get("https://dummyjson.com/products")
```

---

# 20. Better version of your code

### `App.jsx`

```jsx
import axios from "axios";
import { useEffect, useState } from "react";
import PaginationButton from "./components/PaginationButton";

const App = () => {
  const [postData, setPostData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://dummyjson.com/products");

      setPostData(res.data.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate indexes
  const lastPostIndex = currentPage * postPerPage;

  const firstPostIndex = lastPostIndex - postPerPage;

  // Get products for current page
  const currentPost = postData.slice(
    firstPostIndex,
    lastPostIndex
  );

  return (
    <div>
      <h1>Products</h1>

      {currentPost.map((item) => (
        <div key={item.id}>
          {item.title}
        </div>
      ))}

      <PaginationButton
        totalPost={postData.length}
        postPerPage={postPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default App;
```

### `PaginationButton.jsx`

```jsx
const PaginationButton = ({
  totalPost,
  postPerPage,
  setCurrentPage,
}) => {

  const totalPages = Math.ceil(totalPost / postPerPage);

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className="w-10 h-10 rounded-md border active:scale-95"
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default PaginationButton;
```

---

# 21. Important interview concept

There are **two major types of pagination** you should know as a MERN developer.

### Client-side pagination

Your current approach:

```text
Fetch ALL data
      ↓
Store ALL data
      ↓
slice()
      ↓
Display current page
```

Example:

```js
axios.get("/products")
```

Then:

```js
postData.slice(firstIndex, lastIndex)
```

Good for:

* Small datasets
* Learning
* Simple applications

Problem:

If you have:

```text
1,000,000 products
```

you don't want to download all 1 million products to the browser.

---

### Server-side pagination

For a real MERN application, you would normally do something like:

```text
Frontend
   │
   │ page=2&limit=10
   ▼
Backend
   │
   ▼
MongoDB
   │
   │ skip + limit
   ▼
10 products
   │
   ▼
Frontend
```

Request:

```http
GET /api/products?page=2&limit=10
```

Backend calculates:

```js
const skip = (page - 1) * limit;
```

Then MongoDB:

```js
Product.find()
  .skip(skip)
  .limit(limit);
```

For page 2:

```text
page = 2
limit = 10

skip = (2 - 1) × 10
     = 10
```

MongoDB returns products 11–20.

---

## The key difference

```text
CLIENT-SIDE

Database
   ↓
1000 products
   ↓
Frontend
   ↓
slice()
   ↓
10 products shown


SERVER-SIDE

Database
   ↓
skip(10).limit(10)
   ↓
10 products
   ↓
Frontend
   ↓
10 products shown
```

For your **MERN interview preparation**, understand both. Your current implementation is excellent for learning the **pagination logic**, while server-side pagination is the important next step for production applications.
