import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Pill, AlertTriangle, Clock, Beaker, Heart, 
    ChevronRight, X, BookOpen, Shield, Activity, Droplets,
    Package, FileText, ArrowLeft, ExternalLink, Star, Info, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import { medicineService, categoryService } from '../../services/api';

// Comprehensive medicine database
const medicineDatabase = [
    {
        id: 1,
        name: "Amoxicillin",
        genericName: "Amoxicillin Trihydrate",
        brandNames: ["Amoxil", "Trimox", "Moxatag"],
        category: "Antibiotic",
        type: "Penicillin-type antibiotic",
        description: "Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.",
        dosageForms: ["Capsules (250mg, 500mg)", "Tablets (500mg, 875mg)", "Oral Suspension (125mg/5ml, 250mg/5ml)", "Chewable Tablets"],
        commonDosage: "250-500mg every 8 hours or 500-875mg every 12 hours",
        activeIngredients: ["Amoxicillin Trihydrate"],
        inactiveIngredients: ["Magnesium stearate", "Sodium starch glycolate", "Gelatin capsule shell"],
        mechanism: "Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins, leading to cell lysis and death.",
        uses: [
            "Respiratory tract infections",
            "Ear infections (otitis media)",
            "Skin and soft tissue infections",
            "Urinary tract infections",
            "H. pylori infection (with other drugs)",
            "Dental infections"
        ],
        sideEffects: {
            common: ["Diarrhea", "Stomach upset", "Nausea", "Vomiting", "Headache", "Rash"],
            serious: ["Severe allergic reaction (anaphylaxis)", "Clostridium difficile-associated diarrhea", "Seizures (high doses)", "Liver problems"]
        },
        contraindications: [
            "Known penicillin allergy",
            "History of severe allergic reaction to any beta-lactam antibiotic",
            "Infectious mononucleosis (may cause rash)"
        ],
        interactions: [
            { drug: "Warfarin", effect: "May increase anticoagulant effect" },
            { drug: "Methotrexate", effect: "Reduced methotrexate clearance" },
            { drug: "Oral contraceptives", effect: "May reduce effectiveness" },
            { drug: "Allopurinol", effect: "Increased risk of skin rash" }
        ],
        warnings: [
            "Complete the full course of treatment",
            "May cause allergic reactions in penicillin-sensitive patients",
            "Use with caution in patients with kidney disease",
            "May cause false-positive urine glucose tests"
        ],
        storage: "Store at room temperature (20-25°C). Keep away from moisture and light. Reconstituted suspension should be refrigerated and discarded after 14 days.",
        pregnancy: "Category B - Generally considered safe during pregnancy",
        breastfeeding: "Compatible with breastfeeding; small amounts pass into breast milk",
        onset: "30-60 minutes",
        duration: "8-12 hours",
        halfLife: "1-1.5 hours",
        image: "https://pngimg.com/uploads/pill/pill_PNG17239.png"
    },
    {
        id: 2,
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        brandNames: ["Advil", "Motrin", "Nurofen", "Brufen"],
        category: "NSAID",
        type: "Non-steroidal anti-inflammatory drug",
        description: "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.",
        dosageForms: ["Tablets (200mg, 400mg, 600mg, 800mg)", "Capsules", "Oral Suspension", "Topical Gel", "IV Solution"],
        commonDosage: "200-400mg every 4-6 hours as needed (max 1200mg/day OTC, 3200mg/day prescription)",
        activeIngredients: ["Ibuprofen"],
        inactiveIngredients: ["Microcrystalline cellulose", "Croscarmellose sodium", "Silicon dioxide", "Magnesium stearate"],
        mechanism: "Inhibits cyclooxygenase (COX-1 and COX-2) enzymes, reducing prostaglandin synthesis, which decreases inflammation, pain, and fever.",
        uses: [
            "Mild to moderate pain relief",
            "Fever reduction",
            "Arthritis (osteoarthritis, rheumatoid)",
            "Menstrual cramps",
            "Headache and migraine",
            "Dental pain",
            "Muscle aches"
        ],
        sideEffects: {
            common: ["Stomach pain", "Nausea", "Vomiting", "Heartburn", "Dizziness", "Mild headache"],
            serious: ["GI bleeding or ulceration", "Kidney problems", "Heart attack or stroke", "Severe skin reactions", "Liver damage"]
        },
        contraindications: [
            "History of allergic reaction to NSAIDs or aspirin",
            "Active GI bleeding or peptic ulcer",
            "Severe heart failure",
            "Third trimester of pregnancy",
            "Immediately before or after heart bypass surgery (CABG)"
        ],
        interactions: [
            { drug: "Aspirin", effect: "May reduce cardioprotective effect of aspirin" },
            { drug: "Warfarin", effect: "Increased bleeding risk" },
            { drug: "ACE inhibitors", effect: "Reduced antihypertensive effect" },
            { drug: "Lithium", effect: "Increased lithium levels" },
            { drug: "Methotrexate", effect: "Increased methotrexate toxicity" }
        ],
        warnings: [
            "Take with food to reduce stomach upset",
            "Avoid alcohol consumption",
            "May increase risk of heart attack or stroke",
            "Use lowest effective dose for shortest duration",
            "Not recommended for children under 6 months"
        ],
        storage: "Store at room temperature (20-25°C). Protect from light and moisture.",
        pregnancy: "Category C (D in third trimester) - Avoid in third trimester",
        breastfeeding: "Compatible in low doses; minimal amounts in breast milk",
        onset: "30-60 minutes",
        duration: "4-6 hours",
        halfLife: "2-4 hours",
        image: "https://pngimg.com/uploads/pill/pill_PNG17235.png"
    },
    {
        id: 3,
        name: "Metformin",
        genericName: "Metformin Hydrochloride",
        brandNames: ["Glucophage", "Glucophage XR", "Fortamet", "Glumetza", "Riomet"],
        category: "Antidiabetic",
        type: "Biguanide",
        description: "Metformin is an oral diabetes medicine that helps control blood sugar levels. It is used together with diet and exercise to improve blood sugar control in adults with type 2 diabetes mellitus.",
        dosageForms: ["Tablets (500mg, 850mg, 1000mg)", "Extended-release tablets", "Oral solution"],
        commonDosage: "Start 500mg twice daily or 850mg once daily, max 2550mg/day in divided doses",
        activeIngredients: ["Metformin Hydrochloride"],
        inactiveIngredients: ["Povidone", "Magnesium stearate", "Hypromellose", "Polyethylene glycol"],
        mechanism: "Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.",
        uses: [
            "Type 2 diabetes mellitus",
            "Prediabetes prevention",
            "Polycystic ovary syndrome (PCOS) - off-label",
            "Weight management in diabetes",
            "Gestational diabetes (some cases)"
        ],
        sideEffects: {
            common: ["Diarrhea", "Nausea", "Stomach upset", "Metallic taste", "Loss of appetite", "Flatulence"],
            serious: ["Lactic acidosis (rare but serious)", "Vitamin B12 deficiency", "Hypoglycemia (when combined with other drugs)"]
        },
        contraindications: [
            "Severe kidney disease (eGFR < 30 mL/min)",
            "Metabolic acidosis including diabetic ketoacidosis",
            "History of lactic acidosis",
            "Acute conditions that may affect kidney function"
        ],
        interactions: [
            { drug: "Alcohol", effect: "Increased risk of lactic acidosis" },
            { drug: "Iodinated contrast", effect: "Risk of acute kidney injury and lactic acidosis" },
            { drug: "Carbonic anhydrase inhibitors", effect: "Increased risk of lactic acidosis" },
            { drug: "Cimetidine", effect: "Increased metformin levels" }
        ],
        warnings: [
            "Hold before procedures with iodinated contrast",
            "Monitor kidney function regularly",
            "May cause vitamin B12 deficiency with long-term use",
            "Take with meals to reduce GI side effects",
            "Do not crush or chew extended-release tablets"
        ],
        storage: "Store at room temperature (20-25°C). Protect from light and moisture.",
        pregnancy: "Category B - May be used during pregnancy under medical supervision",
        breastfeeding: "Present in breast milk; generally considered compatible",
        onset: "2-4 weeks for full effect",
        duration: "24 hours (extended-release)",
        halfLife: "4-8.7 hours",
        image: "https://pngimg.com/uploads/pill/pill_PNG17242.png"
    },
    {
        id: 4,
        name: "Lisinopril",
        genericName: "Lisinopril",
        brandNames: ["Prinivil", "Zestril", "Qbrelis"],
        category: "Cardiovascular",
        type: "ACE Inhibitor",
        description: "Lisinopril is an angiotensin-converting enzyme (ACE) inhibitor used to treat high blood pressure, heart failure, and to improve survival after heart attack. It works by relaxing blood vessels so blood can flow more easily.",
        dosageForms: ["Tablets (2.5mg, 5mg, 10mg, 20mg, 30mg, 40mg)", "Oral Solution"],
        commonDosage: "Start 5-10mg once daily, usual maintenance 20-40mg once daily",
        activeIngredients: ["Lisinopril Dihydrate"],
        inactiveIngredients: ["Calcium phosphate", "Mannitol", "Magnesium stearate", "Starch"],
        mechanism: "Inhibits angiotensin-converting enzyme (ACE), preventing conversion of angiotensin I to angiotensin II, resulting in vasodilation and reduced aldosterone secretion.",
        uses: [
            "Hypertension (high blood pressure)",
            "Heart failure",
            "Post-myocardial infarction",
            "Diabetic nephropathy",
            "Left ventricular dysfunction"
        ],
        sideEffects: {
            common: ["Dry cough", "Dizziness", "Headache", "Fatigue", "Nausea", "Hypotension"],
            serious: ["Angioedema", "Hyperkalemia", "Acute kidney injury", "Severe hypotension", "Neutropenia"]
        },
        contraindications: [
            "History of angioedema with ACE inhibitors",
            "Hereditary or idiopathic angioedema",
            "Pregnancy (all trimesters)",
            "Concomitant use with aliskiren in diabetic patients"
        ],
        interactions: [
            { drug: "Potassium supplements", effect: "Risk of hyperkalemia" },
            { drug: "NSAIDs", effect: "Reduced antihypertensive effect, kidney damage" },
            { drug: "Lithium", effect: "Increased lithium toxicity" },
            { drug: "Diuretics", effect: "Excessive blood pressure reduction" }
        ],
        warnings: [
            "May cause fetal harm - discontinue immediately if pregnancy detected",
            "Monitor potassium levels",
            "Risk of angioedema - seek immediate medical attention for swelling",
            "First-dose hypotension possible",
            "Use caution in patients with renal artery stenosis"
        ],
        storage: "Store at room temperature (20-25°C). Protect from moisture.",
        pregnancy: "Category D - Contraindicated in pregnancy",
        breastfeeding: "Unknown if excreted in breast milk; use with caution",
        onset: "1-2 hours",
        duration: "24 hours",
        halfLife: "12 hours",
        image: "https://pngimg.com/uploads/pill/pill_PNG17255.png"
    },
    {
        id: 5,
        name: "Omeprazole",
        genericName: "Omeprazole",
        brandNames: ["Prilosec", "Losec", "Omesec", "Zegerid"],
        category: "Gastrointestinal",
        type: "Proton Pump Inhibitor (PPI)",
        description: "Omeprazole is a proton pump inhibitor that decreases the amount of acid produced in the stomach. It is used to treat symptoms of gastroesophageal reflux disease (GERD), stomach ulcers, and conditions involving excessive stomach acid.",
        dosageForms: ["Delayed-release capsules (10mg, 20mg, 40mg)", "Powder for oral suspension", "IV injection"],
        commonDosage: "20-40mg once daily, typically before breakfast",
        activeIngredients: ["Omeprazole"],
        inactiveIngredients: ["Cellulose", "Disodium hydrogen phosphate", "Hydroxypropyl cellulose", "Hypromellose", "Lactose"],
        mechanism: "Irreversibly inhibits the hydrogen-potassium ATPase enzyme system (proton pump) in gastric parietal cells, blocking the final step of acid production.",
        uses: [
            "Gastroesophageal reflux disease (GERD)",
            "Peptic ulcer disease",
            "H. pylori eradication (with antibiotics)",
            "Zollinger-Ellison syndrome",
            "NSAID-induced gastric ulcers",
            "Erosive esophagitis"
        ],
        sideEffects: {
            common: ["Headache", "Diarrhea", "Abdominal pain", "Nausea", "Flatulence", "Dizziness"],
            serious: ["Clostridium difficile infection", "Bone fractures (long-term use)", "Vitamin B12 deficiency", "Hypomagnesemia", "Kidney problems"]
        },
        contraindications: [
            "Known hypersensitivity to omeprazole or substituted benzimidazoles",
            "Concomitant use with rilpivirine-containing products"
        ],
        interactions: [
            { drug: "Clopidogrel", effect: "Reduced clopidogrel effectiveness" },
            { drug: "Methotrexate", effect: "Increased methotrexate levels" },
            { drug: "Atazanavir", effect: "Reduced atazanavir absorption" },
            { drug: "Warfarin", effect: "Increased INR and bleeding risk" }
        ],
        warnings: [
            "Long-term use associated with increased fracture risk",
            "May mask symptoms of gastric cancer",
            "Monitor magnesium levels with prolonged use",
            "Take 30-60 minutes before meals",
            "Do not crush or chew delayed-release capsules"
        ],
        storage: "Store at room temperature (15-25°C). Protect from light and moisture.",
        pregnancy: "Category C - Use only if benefit outweighs risk",
        breastfeeding: "Excreted in breast milk; use with caution",
        onset: "1 hour, full effect in 1-4 days",
        duration: "24 hours",
        halfLife: "0.5-1 hour (but effect lasts 24+ hours)",
        image: "https://pngimg.com/uploads/pill/pill_PNG17260.png"
    },
    {
        id: 6,
        name: "Cetirizine",
        genericName: "Cetirizine Hydrochloride",
        brandNames: ["Zyrtec", "Reactine", "Alerid", "Cetrine"],
        category: "Antihistamine",
        type: "Second-generation H1 antihistamine",
        description: "Cetirizine is an antihistamine that reduces the effects of natural chemical histamine in the body. It is used to treat cold or allergy symptoms such as sneezing, itching, watery eyes, or runny nose.",
        dosageForms: ["Tablets (5mg, 10mg)", "Chewable tablets", "Oral syrup", "Oral solution"],
        commonDosage: "5-10mg once daily",
        activeIngredients: ["Cetirizine Hydrochloride"],
        inactiveIngredients: ["Lactose monohydrate", "Microcrystalline cellulose", "Colloidal silicon dioxide", "Magnesium stearate"],
        mechanism: "Selectively blocks peripheral H1 histamine receptors, preventing histamine from binding and causing allergic symptoms.",
        uses: [
            "Seasonal allergic rhinitis (hay fever)",
            "Perennial allergic rhinitis",
            "Chronic urticaria (hives)",
            "Allergic conjunctivitis",
            "Allergic skin conditions"
        ],
        sideEffects: {
            common: ["Drowsiness", "Dry mouth", "Fatigue", "Headache", "Sore throat", "Nausea"],
            serious: ["Severe allergic reaction", "Difficulty urinating", "Vision problems", "Fast or irregular heartbeat"]
        },
        contraindications: [
            "Hypersensitivity to cetirizine, hydroxyzine, or any component",
            "End-stage renal disease requiring dialysis",
            "Children under 6 months"
        ],
        interactions: [
            { drug: "Alcohol", effect: "Enhanced CNS depression" },
            { drug: "CNS depressants", effect: "Additive sedative effects" },
            { drug: "Theophylline", effect: "Slightly decreased cetirizine clearance" }
        ],
        warnings: [
            "May cause drowsiness - use caution when driving",
            "Reduce dose in kidney or liver impairment",
            "Avoid alcohol",
            "Use caution in elderly patients",
            "May impair mental alertness"
        ],
        storage: "Store at room temperature (20-25°C). Protect from moisture.",
        pregnancy: "Category B - Generally considered safe",
        breastfeeding: "Excreted in breast milk; use with caution",
        onset: "20-60 minutes",
        duration: "24 hours",
        halfLife: "8-9 hours",
        image: "https://pngimg.com/uploads/pill/pill_PNG17243.png"
    },
    {
        id: 7,
        name: "Atorvastatin",
        genericName: "Atorvastatin Calcium",
        brandNames: ["Lipitor", "Torvast", "Atorva"],
        category: "Cardiovascular",
        type: "HMG-CoA reductase inhibitor (Statin)",
        description: "Atorvastatin is a statin medication used to lower cholesterol and triglycerides in the blood. It helps reduce the risk of heart attack, stroke, and other heart complications in people with type 2 diabetes, coronary heart disease, or other risk factors.",
        dosageForms: ["Tablets (10mg, 20mg, 40mg, 80mg)"],
        commonDosage: "10-80mg once daily, typically in the evening",
        activeIngredients: ["Atorvastatin Calcium Trihydrate"],
        inactiveIngredients: ["Calcium carbonate", "Candelilla wax", "Croscarmellose sodium", "Hydroxypropyl cellulose", "Lactose monohydrate"],
        mechanism: "Competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis, leading to increased LDL receptor expression and enhanced LDL clearance from blood.",
        uses: [
            "Primary hyperlipidemia",
            "Mixed dyslipidemia",
            "Prevention of cardiovascular disease",
            "Familial hypercholesterolemia",
            "Reducing risk of heart attack and stroke"
        ],
        sideEffects: {
            common: ["Muscle pain", "Joint pain", "Diarrhea", "Nausea", "Headache", "Cold symptoms"],
            serious: ["Rhabdomyolysis", "Liver damage", "Memory problems", "Type 2 diabetes", "Tendon problems"]
        },
        contraindications: [
            "Active liver disease or unexplained persistent elevations of serum transaminases",
            "Pregnancy and breastfeeding",
            "Hypersensitivity to any component"
        ],
        interactions: [
            { drug: "Gemfibrozil", effect: "Increased risk of myopathy" },
            { drug: "Clarithromycin", effect: "Increased atorvastatin levels" },
            { drug: "Cyclosporine", effect: "Increased atorvastatin levels" },
            { drug: "Grapefruit juice", effect: "Increased atorvastatin levels" },
            { drug: "Warfarin", effect: "May increase INR" }
        ],
        warnings: [
            "Report unexplained muscle pain or weakness immediately",
            "Monitor liver function tests",
            "Avoid grapefruit and grapefruit juice",
            "Use effective contraception - harmful to fetus",
            "May increase blood sugar levels"
        ],
        storage: "Store at room temperature (20-25°C). Protect from light.",
        pregnancy: "Category X - Contraindicated in pregnancy",
        breastfeeding: "Contraindicated during breastfeeding",
        onset: "2-4 weeks for cholesterol reduction",
        duration: "24 hours",
        halfLife: "14 hours (active metabolites: 20-30 hours)",
        image: "https://pngimg.com/uploads/pill/pill_PNG17239.png"
    },
    {
        id: 8,
        name: "Paracetamol",
        genericName: "Acetaminophen / Paracetamol",
        brandNames: ["Tylenol", "Panadol", "Calpol", "Crocin", "Dolo"],
        category: "Analgesic",
        type: "Non-opioid analgesic and antipyretic",
        description: "Paracetamol (acetaminophen) is a pain reliever and fever reducer. It is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
        dosageForms: ["Tablets (325mg, 500mg, 650mg)", "Capsules", "Oral suspension", "Suppositories", "IV solution", "Effervescent tablets"],
        commonDosage: "325-1000mg every 4-6 hours as needed (max 4000mg/day, lower in liver disease)",
        activeIngredients: ["Paracetamol (Acetaminophen)"],
        inactiveIngredients: ["Corn starch", "Povidone", "Stearic acid", "Sodium starch glycolate"],
        mechanism: "Exact mechanism not fully understood. Thought to inhibit COX enzymes centrally, and may involve the endocannabinoid system. Reduces fever through action on the hypothalamic heat-regulating center.",
        uses: [
            "Mild to moderate pain relief",
            "Fever reduction",
            "Headache and migraine",
            "Muscle aches",
            "Arthritis pain",
            "Dental pain",
            "Cold and flu symptoms"
        ],
        sideEffects: {
            common: ["Nausea", "Stomach pain", "Loss of appetite", "Headache (with overuse)", "Rash (rare)"],
            serious: ["Severe liver damage (overdose)", "Severe skin reactions (rare)", "Blood disorders (rare)", "Kidney problems (prolonged high-dose use)"]
        },
        contraindications: [
            "Severe liver impairment",
            "Known hypersensitivity to paracetamol"
        ],
        interactions: [
            { drug: "Warfarin", effect: "May increase INR with regular use" },
            { drug: "Alcohol", effect: "Increased risk of liver damage" },
            { drug: "Isoniazid", effect: "Increased risk of hepatotoxicity" },
            { drug: "Carbamazepine", effect: "Increased paracetamol metabolism" }
        ],
        warnings: [
            "Do not exceed maximum daily dose",
            "Avoid alcohol consumption",
            "Check other medications for hidden paracetamol",
            "Reduce dose in liver disease",
            "Seek immediate medical attention for overdose"
        ],
        storage: "Store at room temperature (20-25°C). Protect from moisture.",
        pregnancy: "Generally considered safe during pregnancy when used as directed",
        breastfeeding: "Compatible with breastfeeding",
        onset: "15-30 minutes (oral), 5-10 minutes (IV)",
        duration: "4-6 hours",
        halfLife: "1-4 hours",
        image: "https://pngimg.com/uploads/pill/pill_PNG17260.png"
    }
];

const categories = ["All", "Antibiotic", "NSAID", "Antidiabetic", "Cardiovascular", "Gastrointestinal", "Antihistamine", "Analgesic"];

const MedicineDetailModal = ({ medicine, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!medicine) return null;
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'usage', label: 'Usage & Dosage', icon: Pill },
        { id: 'safety', label: 'Safety Info', icon: Shield }
    ];

    // Parse indications if it's a string
    const indications = typeof medicine.indications === 'string' 
        ? medicine.indications.split(/[,;]/).map(s => s.trim()).filter(Boolean)
        : Array.isArray(medicine.indications) ? medicine.indications : [];
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-white/20 rounded-xl p-4 flex items-center justify-center">
                            {medicine.imageUrl ? (
                                <img src={medicine.imageUrl} alt={medicine.brandName || medicine.name} className="w-full h-full object-contain" />
                            ) : (
                                <Pill size={40} className="text-white/80" />
                            )}
                        </div>
                        <div className="flex-1">
                            <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium uppercase tracking-wider">
                                {medicine.categoryName || medicine.form || 'Medicine'}
                            </span>
                            <h2 className="text-3xl font-bold mt-2">{medicine.brandName || medicine.name}</h2>
                            <p className="text-blue-100 mt-1">{medicine.genericName}</p>
                            {medicine.manufacturerName && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                        {medicine.manufacturerName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-slate-200 px-6 overflow-x-auto">
                    <div className="flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {medicine.description && (
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
                                    <p className="text-slate-600 leading-relaxed">{medicine.description}</p>
                                </div>
                            )}
                            
                            {indications.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">Uses / Indications</h3>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        {indications.slice(0, 10).map((indication, i) => (
                                            <li key={i}>{indication}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {medicine.strength && (
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <Package size={18} className="text-primary mb-2" />
                                        <p className="text-xs text-slate-500">Strength</p>
                                        <p className="font-medium text-slate-800">{medicine.strength}</p>
                                    </div>
                                )}
                                {medicine.form && (
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <Pill size={18} className="text-primary mb-2" />
                                        <p className="text-xs text-slate-500">Form</p>
                                        <p className="font-medium text-slate-800">{medicine.form}</p>
                                    </div>
                                )}
                                {medicine.isOtc !== undefined && (
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <Shield size={18} className="text-primary mb-2" />
                                        <p className="text-xs text-slate-500">Type</p>
                                        <p className="font-medium text-slate-800">{medicine.isOtc ? 'OTC' : 'Prescription'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'usage' && (
                        <div className="space-y-6">
                            {medicine.strength && (
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">Dosage Information</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        Available in: {medicine.strength}
                                    </p>
                                </div>
                            )}
                            
                            {medicine.form && (
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">Form</h3>
                                    <p className="text-slate-600">{medicine.form}</p>
                                </div>
                            )}
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-amber-800 mb-1">Important</h4>
                                        <p className="text-sm text-amber-700">
                                            Always follow your healthcare provider's instructions for dosage and usage.
                                            Do not modify your dosage without consulting a doctor.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'safety' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-800 mb-1">General Safety Information</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Store in a cool, dry place away from sunlight</li>
                                            <li>• Keep out of reach of children</li>
                                            <li>• Check expiration date before use</li>
                                            <li>• Consult a healthcare provider before taking with other medications</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Important Warnings
                                </h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    <li>• Do not exceed recommended dose</li>
                                    <li>• Seek immediate medical attention if you experience severe side effects</li>
                                    <li>• Inform your doctor about all medications you are taking</li>
                                    <li>• Pregnant or nursing mothers should consult a doctor before use</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const MedBase = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [medicinesData, categoriesData] = await Promise.all([
                medicineService.getAll(0, 20),
                categoryService.getAll().catch(() => [])
            ]);
            
            // Handle medicines data
            if (medicinesData?.content) {
                setMedicines(medicinesData.content);
                setTotalPages(medicinesData.totalPages || 1);
            } else if (Array.isArray(medicinesData)) {
                setMedicines(medicinesData);
            }
            
            // Handle categories data
            if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                setCategories(['All', ...categoriesData.map(c => c.name)]);
            }
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            fetchInitialData();
            return;
        }
        try {
            setSearching(true);
            const data = await medicineService.search(query, 0, 50);
            if (data?.content) {
                setMedicines(data.content);
            } else if (Array.isArray(data)) {
                setMedicines(data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const loadMoreMedicines = async () => {
        try {
            const nextPage = page + 1;
            const data = await medicineService.getAll(nextPage, 20);
            if (data?.content) {
                setMedicines(prev => [...prev, ...data.content]);
                setPage(nextPage);
            }
        } catch (error) {
            console.error('Failed to load more:', error);
        }
    };

    // Filter by category locally
    const filteredMedicines = useMemo(() => {
        return medicines.filter(med => {
            const matchesCategory = selectedCategory === 'All' || 
                med.category === selectedCategory ||
                med.categoryName === selectedCategory;
            return matchesCategory;
        });
    }, [medicines, selectedCategory]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white">
                                <BookOpen size={20} />
                            </div>
                            <span className="hidden sm:inline">MedBase</span>
                        </div>
                        <Link to="/dashboard">
                            <Button variant="outline" size="sm">Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </header>
            
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Medicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Knowledge Base</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                        Search our comprehensive database to learn about medications, their uses, side effects, interactions, and safety information.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search by medicine name, brand, or condition..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-12 h-14 text-lg bg-white border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl"
                        />
                        {searching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
                        )}
                    </div>
                </motion.div>
            </section>
            
            {/* Category Filter */}
            <section className="container mx-auto px-4 pb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                selectedCategory === category
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>
            
            {/* Results */}
            <section className="container mx-auto px-4 pb-12">
                <div className="mb-4 text-slate-500 text-sm">
                    {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''} found
                </div>
                
                {filteredMedicines.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Pill size={64} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No medicines found</h3>
                        <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                        >
                            Clear Filters
                        </Button>
                    </motion.div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMedicines.map((medicine, i) => (
                            <motion.div
                                key={medicine.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                            >
                                <Card 
                                    className="h-full hover:shadow-xl transition-all cursor-pointer group border-slate-100 overflow-hidden"
                                    onClick={() => setSelectedMedicine(medicine)}
                                >
                                    <div className="h-32 bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center group-hover:from-blue-50 group-hover:to-primary/10 transition-colors">
                                        {medicine.imageUrl ? (
                                            <img 
                                                src={medicine.imageUrl} 
                                                alt={medicine.brandName || medicine.name} 
                                                className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                                            />
                                        ) : (
                                            <Pill size={48} className="text-primary/30 group-hover:scale-110 transition-transform" />
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <span className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">
                                            {medicine.categoryName || medicine.form || 'Medicine'}
                                        </span>
                                        <h3 className="font-bold text-lg text-slate-800 mt-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {medicine.brandName || medicine.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-2 line-clamp-1">{medicine.genericName}</p>
                                        <p className="text-sm text-slate-600 line-clamp-2">{medicine.strength || medicine.description || ''}</p>
                                        
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Package size={12} />
                                                {medicine.manufacturerName || 'Manufacturer'}
                                            </div>
                                            <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                View <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* Load More Button */}
                    {page < totalPages - 1 && searchQuery.length < 2 && (
                        <div className="text-center mt-8">
                            <Button variant="outline" onClick={loadMoreMedicines}>
                                Load More Medicines
                            </Button>
                        </div>
                    )}
                    </>
                )}
            </section>
            
            {/* Disclaimer */}
            <section className="container mx-auto px-4 pb-12">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
                    <h3 className="font-semibold text-amber-800 mb-2">Medical Disclaimer</h3>
                    <p className="text-sm text-amber-700 max-w-2xl mx-auto">
                        The information provided in MedBase is for educational purposes only and is not intended as medical advice. 
                        Always consult with a qualified healthcare professional before starting, stopping, or changing any medication.
                    </p>
                </div>
            </section>
            
            {/* Detail Modal */}
            <AnimatePresence>
                {selectedMedicine && (
                    <MedicineDetailModal 
                        medicine={selectedMedicine} 
                        onClose={() => setSelectedMedicine(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedBase;
