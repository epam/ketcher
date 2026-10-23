## Service Providers

Ketcher uses a service provider pattern for chemical operations. Two implementations are available:

### RemoteStructServiceProvider

Uses **Indigo Service** (REST API) for server-side chemical operations.

**Location:** `ketcher-core`

**Constructor:**

```typescript
constructor(
  apiPath: string,
  defaultOptions?: Record<string, any>,
  customHeaders?: Record<string, string>
)
```

**Example:**

```javascript
import { RemoteStructServiceProvider } from 'ketcher-core';

const provider = new RemoteStructServiceProvider(
  'http://localhost:8002',
  {
    'smart-layout': true,
    'ignore-stereochemistry-errors': true
  },
  {
    'Authorization': 'Bearer token123',
    'Custom-Header': 'value'
  }
);
```

**Default Options:**

```javascript
{
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'ignore-no-chiral-flag': false
}
```

---

### StandaloneStructServiceProvider

Uses **Indigo WASM** (client-side) for chemical operations without server dependency.

**Location:** `ketcher-standalone`

**Constructor:**

```typescript
constructor()
```

**Example:**

```javascript
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

const provider = new StandaloneStructServiceProvider();
```

**Note:** WASM bundle is larger but provides offline capabilities.

---

### Configure indigo service

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).
