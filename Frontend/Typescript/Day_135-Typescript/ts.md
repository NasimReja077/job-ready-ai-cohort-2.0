**TypeScript Types Explained**

### 1. Primitive Types

#### **string**
Represents text.

```ts
let name: string = "Alice";
let greeting: string = `Hello, ${name}!`;

const message: string = "TypeScript is awesome";
```

#### **number**
Represents numbers (integer or float).

```ts
let age: number = 25;
let price: number = 99.99;
let hex: number = 0xff;        // hexadecimal
let binary: number = 0b1010;   // binary
```

#### **boolean**
True or false values.

```ts
let isActive: boolean = true;
let isLoggedIn: boolean = false;
```

---

### 2. Complex Types

#### **Array**
Two ways to declare arrays:

```ts
// Method 1: Generic
let numbers: Array<number> = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Method 2: Shorthand (most common)
let scores: number[] = [85, 90, 95];
let fruits: string[] = ["apple", "banana"];

// Mixed array (not recommended)
let mixed: (string | number)[] = ["hello", 42];
```

#### **Object**

```ts
// Best way: Use Interface or Type Alias
interface User {
  name: string;
  age: number;
  isActive?: boolean;     // optional property
}

const user: User = {
  name: "John",
  age: 30
};

// Inline object type
const person: { name: string; age: number } = {
  name: "Sarah",
  age: 28
};
```

#### **Tuple**
Fixed-length array with specific types for each position.

```ts
let coordinates: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["Alice", 25, true];

// You can make the rest optional
let rgb: [number, number, number, number?] = [255, 0, 0];
```

---

### 3. Special Types

#### **void**
Used for functions that **do not return** any value.

```ts
function logMessage(message: string): void {
  console.log(message);
  // No return statement (or return undefined)
}

const greet = (): void => {
  console.log("Hello!");
};
```

#### **never**
Represents values that **never occur**. Used for:
- Functions that never return (infinite loops or always throw)
- Exhaustive checks

```ts
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    console.log("Running...");
  }
}

// Exhaustive check example
type Shape = "circle" | "square";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle": return 3.14;
    case "square": return 4;
    default:
      // TypeScript will error if you miss a case
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

---

### 4. Type Declaration

#### **`type` Alias**
Creates a name for any type.

```ts
type ID = string | number;

type User = {
  id: ID;
  name: string;
  email: string;
};

type Point = [number, number];   // tuple alias

const userId: ID = 123;
```

---

### 5. Special "Any" Types

#### **`any`**
Disables type checking. Use **only when necessary**.

```ts
let data: any = "hello";
data = 42;
data = { name: "test" };
data.toUpperCase();     // No error (dangerous!)
```

**Warning**: Overusing `any` defeats the purpose of TypeScript.

#### **`unknown`**
Safer alternative to `any`. You must check the type before using it.

```ts
let input: unknown = "some value";

// You cannot use it directly:
 // input.toUpperCase(); // Error

// Type narrowing required
if (typeof input === "string") {
  console.log(input.toUpperCase());   // Safe now
}

function parseInput(input: unknown) {
  if (typeof input === "string") return input;
  if (typeof input === "number") return input.toString();
  return "Unknown";
}
```

---

### Summary Table

| Type       | Purpose                          | Example                     |
|------------|----------------------------------|-----------------------------|
| `string`   | Text                             | `"hello"`                   |
| `number`   | Numbers                          | `42`, `3.14`                |
| `boolean`  | True/False                       | `true`                      |
| `array`    | List of values                   | `string[]`                  |
| `object`   | Key-value pairs                  | `{ name: string }`          |
| `tuple`    | Fixed array with types           | `[string, number]`          |
| `void`     | No return value                  | `(): void`                  |
| `never`    | Never returns / unreachable      | `throwError()`              |
| `type`     | Create alias                     | `type ID = string \| number`|
| `any`      | Disable type checking            | Avoid when possible         |
| `unknown`  | Safe unknown value               | Preferred over `any`        |

---
---

**TypeScript Advanced Types Guide**  
(Union, Intersection, Interfaces vs Types, Generics, Type Guards)

---

### 1. Union Types (`|`)

Union types allow a value to be **one of several types**.

```ts
// Basic Union
let id: string | number;
id = "user123";     // OK
id = 456;           // OK
// id = true;       // Error

// Union with literals (very useful)
type Status = "pending" | "approved" | "rejected";

let requestStatus: Status = "pending";

// Function example
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
```

**Real-world use**: API responses, form inputs, state management.

---

### 2. Intersection Types (`&`)

Intersection types combine multiple types into **one**. The result must satisfy **all** types.

```ts
interface Person {
  name: string;
  age: number;
}

interface Employee {
  employeeId: string;
  department: string;
}

// Intersection
type EmployeePerson = Person & Employee;

const emp: EmployeePerson = {
  name: "Alice",
  age: 30,
  employeeId: "E001",
  department: "Engineering"
};
```

**Common Pattern**: Extending props

```ts
type ButtonProps = {
  label: string;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = (props: ButtonProps) => { ... };
```

---

### 3. Interfaces vs Type Aliases

| Feature                    | `interface`                  | `type`                          | Winner?      |
|---------------------------|------------------------------|----------------------------------|--------------|
| Merging (Declaration)     | Yes (auto merged)            | No                               | Interface    |
| Extends                   | `extends`                    | `&` (intersection)               | Both         |
| Primitives / Unions       | Not ideal                    | Excellent                        | Type         |
| Tuples / Unions           | Limited                      | Full support                     | Type         |
| Readability (Objects)     | Better for classes/objects   | Good                             | Interface    |
| Computable / Mapped types | Limited                      | Very powerful                    | Type         |

#### **Interface Example**

```ts
interface User {
  name: string;
  age: number;
}

// Declaration Merging (useful in libraries)
interface User {
  email: string;        // Merged with above
}
```

#### **Type Alias Example**

```ts
type ID = string | number;

type User = {
  name: string;
  age: number;
};

// Cannot merge like interface
```

**Modern Recommendation (2026)**:
- Use **`interface`** for **objects** and **public APIs**
- Use **`type`** for **unions**, **intersections**, **tuples**, and **complex types**

---

### 4. Generics

Generics allow you to create **reusable components** that work with different types.

#### Basic Generic

```ts
function identity<T>(arg: T): T {
  return arg;
}

const num = identity(42);           // T inferred as number
const str = identity("hello");      // T inferred as string
```

#### Generic with Constraints

```ts
interface Lengthy {
  length: number;
}

function getLength<T extends Lengthy>(item: T): number {
  return item.length;
}

getLength("hello");        // OK
getLength([1,2,3]);        // OK
// getLength(123);         // Error - number has no length
```

#### Generic Interface / Type

```ts
interface Box<T> {
  value: T;
  createdAt: Date;
}

const numberBox: Box<number> = { value: 100, createdAt: new Date() };
const stringBox: Box<string> = { value: "secret", createdAt: new Date() };
```

#### Generic Component (React)

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}
```

---

### 5. Type Guards

Type Guards help TypeScript narrow down types.

#### a. `typeof` Guard

```ts
function processInput(input: string | number) {
  if (typeof input === "string") {
    return input.toUpperCase();     // string
  } else {
    return input.toFixed(2);        // number
  }
}
```

#### b. `in` Operator

```ts
interface Admin {
  role: "admin";
  permissions: string[];
}

interface User {
  role: "user";
}

function isAdmin(person: Admin | User): boolean {
  return "permissions" in person;   // Type Guard
}
```

#### c. `instanceof` Guard

```ts
if (error instanceof Error) {
  console.log(error.message);
}
```

#### d. Custom Type Guard (Best for complex cases)

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());   // TypeScript knows it's string
  }
}
```

---
---
