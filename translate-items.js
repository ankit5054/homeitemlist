const fs = require('fs');

// Translation mappings
const itemTranslations = {
  "Surf Excel Powder": "सर्फ एक्सेल पाउडर",
  "Surf Excel Soap": "सर्फ एक्सेल साबुन",
  "Detol Soap": "डेटॉल साबुन",
  "Patla Poha": "पतला पोहा",
  "Jeera": "जीरा",
  "Misri": "मिश्री",
  "Tata Tea Premium": "टाटा टी प्रीमियम",
  "Til Oil": "तिल का तेल",
  "Garnier Natural Black": "गार्नियर नेचुरल ब्लैक",
  "MDH Garam Masala": "एमडीएच गरम मसाला",
  "Phenyl": "फिनाइल",
  "Tata Namak": "टाटा नमक",
  "Head & Shoulder": "हेड एंड शोल्डर",
  "Scotch Brite": "स्कॉच ब्राइट",
  "Dant Kanti 100g": "दंत कांति 100ग्राम",
  "Soya bean Badi": "सोयाबीन बड़ी",
  "Dhaniya Powder": "धनिया पाउडर",
  "Kaju": "काजू",
  "Makhana": "मखाना",
  "Kali Masur": "काली मसूर",
  "Sarson Oil": "सरसों का तेल",
  "Sookhi Dhoopbati": "सूखी धूपबत्ती",
  "MDH CHhola Masala": "एमडीएच छोला मसाला",
  "Chhola": "छोला",
  "Rajma": "राजमा",
  "No.1": "नंबर 1",
  "Haldi": "हल्दी",
  "Jabe": "जावे",
  "Clove": "लौंग",
  "Vim Bar": "विम बार",
  "Match": "माचिस",
  "Suji": "सूजी",
  "Hing": "हींग",
  "Moongfali": "मूंगफली",
  "Maggi": "मैगी",
  "Chhuhada": "छुहारा",
  "Besan": "बेसन",
  "Chini": "चीनी",
  "Lal Mirch Kuti": "लाल मिर्च कुटी",
  "Lal Mirch Powder": "लाल मिर्च पाउडर",
  "Gola": "गोला",
  "Gud": "गुड़",
  "Juna": "जूना",
  "Moongfali Oil": "मूंगफली का तेल",
  "Kishmish": "किशमिश",
  "Home Lite": "होम लाइट",
  "Hair & Care": "हेयर एंड केयर"
};

const unitTranslations = {
  "kg": "किग्रा",
  "Kg": "किग्रा", 
  "g": "ग्राम",
  "L": "लीटर",
  "pkt": "पैकेट",
  "Pc": "पीस",
  "pc": "पीस",
  "set": "सेट"
};

// Read the original items.json
const items = JSON.parse(fs.readFileSync('./src/items.json', 'utf8'));

// Convert to new format with translations
const translatedItems = items.map(item => ({
  item: {
    en: item.item,
    hi: itemTranslations[item.item] || item.item
  },
  unit: item.unit.map(unit => ({
    en: unit,
    hi: unitTranslations[unit] || unit
  }))
}));

// Write the new file
fs.writeFileSync('./src/items-translated.json', JSON.stringify(translatedItems, null, 2));
console.log('Translation complete! Check items-translated.json');