const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsonLogic = require('json-logic-js');
const rules = require('./rules.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.json({ok: true}));

app.post('/api/validate', (req, res) => {
  const data = req.body || {};
  const violations = [];

  for (const rule of rules.rules) {
    try {
      const result = jsonLogic.apply(rule.logic, data);
      if (result) {
        violations.push({ id: rule.id, field: rule.field, message: rule.message });
      }
    } catch (err) {
      console.error('rule eval error', rule.id, err);
      violations.push({ id: rule.id, field: rule.field, message: `Rule evaluation error: ${err.message}` });
    }
  }

  res.json({ valid: violations.length === 0, violations });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Configurator validation server listening on ${PORT}`));
