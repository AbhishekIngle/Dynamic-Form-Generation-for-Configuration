# React Configurator Sample

This project demonstrates **Dynamic Form Generation for Configuration Management** using React on the frontend and Node.js/Express on the backend.

The goal is to show how to build a **configurator** where the form adapts to user choices and validates thousands of possible product configurations in real-time.

---

## ✨ Features

- **Dynamic Forms** powered by [`@rjsf/core`](https://github.com/rjsf-team/react-jsonschema-form)
- **Schema-driven UI**: forms adapt automatically when selecting product models
- **Client-side validation** for instant feedback
- **Server-side validation** with custom business rules powered by [`json-logic-js`](https://github.com/jwadhams/json-logic-js)
- **Express.js API** for validating configurations against rule sets
- **Modular and extensible**: add new models, fields, or rules easily

---

## 🗂 Project Structure

```
react-configurator-sample/
├── frontend/              # React app (Vite + @rjsf/core)
│   ├── src/
│   │   ├── App.jsx        # Main UI logic
│   │   ├── main.jsx       # React entrypoint
│   │   ├── schema.json    # JSON schema driving the form
│   │   ├── styles.css     # Simple styles
│   │   └── ...
│   └── package.json
│
├── server/                # Express backend
│   ├── index.js           # Validation API
│   ├── rules.json         # Business rules
│   └── package.json
│
└── README.md              # Documentation
```

---

## 🚀 Getting Started

### 1. Clone and Install
```bash
# Unzip or clone this repository
cd react-configurator-sample

# Install server dependencies
cd server
npm install

# In another terminal, install frontend dependencies
cd ../frontend
npm install
```

### 2. Run the Backend Server
```bash
cd server
node index.js
```
Server will run at [http://localhost:4000](http://localhost:4000).

### 3. Run the Frontend
```bash
cd frontend
npm run dev
```
Frontend will run at [http://localhost:5173](http://localhost:5173) (default Vite port).

---

## 🛠 How It Works

1. **Dynamic Form Generation**  
   The form is defined in `schema.json` using JSON Schema. For example:
   ```json
   {
     "title": "Widget Config",
     "type": "object",
     "properties": {
       "model": { "type": "string", "enum": ["A", "B", "C"] },
       "color": { "type": "string", "enum": ["red", "green", "blue"] }
     },
     "dependencies": {
       "model": {
         "oneOf": [
           {
             "properties": {
               "model": { "const": "A" },
               "size": { "type": "string", "enum": ["small", "medium"] }
             }
           },
           {
             "properties": {
               "model": { "const": "B" },
               "size": { "type": "string", "enum": ["large"] }
             }
           }
         ]
       }
     }
   }
   ```

   Selecting different models dynamically updates the available fields.

2. **Client-side Validation**  
   Implemented in `App.jsx`. Example rule:  
   - If model = "C" → color cannot be "red".

3. **Server-side Validation**  
   Rules are stored in `rules.json` and evaluated by [`json-logic-js`](https://github.com/jwadhams/json-logic-js).  
   Example:
   ```json
   {
     "id": "invalidColorForC",
     "message": "Red is not allowed for model C",
     "field": "color",
     "logic": { "and": [ { "==": [ { "var": "model" }, "C" ] }, { "==": [ { "var": "color" }, "red" ] } ] }
   }
   ```

   When the form is submitted, frontend sends data to `POST /api/validate`, server applies rules, and returns violations.

---

## 📚 Resources to Learn More

- JSON Schema: https://json-schema.org/
- React JSONSchema Form: https://rjsf-team.github.io/react-jsonschema-form/
- json-logic-js (business rules engine): https://jsonlogic.com/
- Express.js: https://expressjs.com/
- Vite (React bundler): https://vitejs.dev/

---

## 📌 Next Steps / Extensions

- Add **database integration** for persisting configurations
- Use **GraphQL** instead of REST for querying PLM data
- Connect to **3D visualization** tools (Three.js, Babylon.js)
- Deploy server + frontend with Docker for production

---

## 📝 License

MIT
