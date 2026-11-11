## Error Handling

Most Ketcher methods return Promises and may throw errors:

```javascript
try {
  await ketcher.setMolecule(invalidStructure);
} catch (error) {
  console.error('Failed to load structure:', error.message);
}

// In React component
<Editor
  structServiceProvider={provider}
  staticResourcesUrl="/public"
  errorHandler={(message) => {
    // Custom error handling
    console.error('Ketcher error:', message);
    showErrorNotification(message);
  }}
/>
```

**Common Errors:**

- Format conversion errors (invalid SMILES, MOL file syntax)
- Service unavailable (Indigo service down)
- Unsupported operations (reaction methods in macromolecules mode)
- Invalid structure data
