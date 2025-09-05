// utils/parser.js
export function parseFieldsFromText(text) {
  const fields = {
    name: "",
    designation: "",
    company: "",
    number: "",
    email: "",
    site: "",
    address: "",
  };

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  lines.forEach(line => {
    if (/director|manager|engineer|developer|ceo|cto|founder/i.test(line)) fields.designation = line;
    else if (/pvt|ltd|software|solutions|technologies|business/i.test(line)) fields.company = line;
    else if (/^\+?\d{5,}/.test(line)) {
      fields.number += (fields.number ? " / " : "") + line.replace(/;/g, " / ");
    }
    else if (/\S+@\S+\.\S+/.test(line)) fields.email = line;
    else if (/www\.|http/i.test(line)) fields.site = line;
    else if (/road|society|garden|nagar|block|city|state|gujar|delhi|india/i.test(line)) {
      fields.address += (fields.address ? " " : "") + line;
    }
    else if (!fields.name) {
      fields.name = line; // fallback
    }
  });

  return fields;
}
