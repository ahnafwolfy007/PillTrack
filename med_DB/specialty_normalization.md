# Medical Specialty Normalization Guide

This document contains the normalization mapping for all 288 distinct specialties found in the doctors database.

## Overview
- **Total Distinct Specialties**: 288
- **Single Specialties**: 79
- **Multi-Specialties (Combined)**: 209

---

## Specialty Normalization Table

| # | Original Specialty | Normalized Specialty | Subspecialties Count |
|---|-------------------|---------------------|---------------------|
| 1 | Allergy Skin-VD → Laser Dermatosurgeon | **Allergy Skin-VD** | 2 |
| 2 | Allergy Skin-VD → Sexual Medicine Specialist → Dermatologist | **Dermatologist** | 3 |
| 3 | Anesthesiologist | **Anesthesiologist** | 1 |
| 4 | Anesthesiologist → Critical Care Specialist | **Anesthesiologist** | 2 |
| 5 | Cardiac Surgeon | **Cardiac Surgeon** | 1 |
| 6 | Cardiac Surgeon → Cardiothoracic and Vascular Surgeon | **Cardiothoracic and Vascular Surgeon** | 2 |
| 7 | Cardiac Surgeon → Pediatric Cardiologist | **Pediatric Cardiologist** | 2 |
| 8 | Cardiologist | **Cardiologist** | 1 |
| 9 | Cardiologist → Cardiac Surgeon | **Cardiac Surgeon** | 2 |
| 10 | Cardiologist → Cardiothoracic and Vascular Surgeon | **Cardiothoracic and Vascular Surgeon** | 2 |
| 11 | Cardiologist → Diabetes Specialist → Medicine Specialist | **Medicine Specialist** | 3 |
| 12 | Cardiologist → Diabetologist | **Diabetologist** | 2 |
| 13 | Cardiologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 14 | Cardiologist → Medicine Specialist → Diabetes Specialist | **Medicine Specialist** | 3 |
| 15 | Cardiologist → Medicine Specialist → Respiratory Specialist → Diabetes Specialist | **Medicine Specialist** | 4 |
| 16 | Cardiologist → Medicine Specialist → Rheumatologist | **Rheumatologist** | 3 |
| 17 | Cardiologist → Pediatric Cardiologist | **Pediatric Cardiologist** | 2 |
| 18 | Cardiologist → Pulmonologist | **Pulmonologist** | 2 |
| 19 | Cardiologist → Rheumatologist → Diabetes Specialist | **Rheumatologist** | 3 |
| 20 | Cardiothoracic Surgeon | **Cardiothoracic Surgeon** | 1 |
| 21 | Cardiothoracic Surgeon → Thoracic Surgeon | **Thoracic Surgeon** | 2 |
| 22 | Cardiothoracic and Vascular Surgeon | **Cardiothoracic and Vascular Surgeon** | 1 |
| 23 | Cardiothoracic and Vascular Surgeon → Thoracic Surgeon | **Thoracic Surgeon** | 2 |
| 24 | Chest Specialist | **Chest Specialist** | 1 |
| 25 | Chest Specialist → Diabetes Specialist → Medicine Specialist | **Medicine Specialist** | 3 |
| 26 | Chest Specialist → Medicine Specialist | **Medicine Specialist** | 2 |
| 27 | Chest Specialist → Pulmonologist | **Pulmonologist** | 2 |
| 28 | Chest Specialist → Respiratory Specialist | **Chest Specialist** | 2 |
| 29 | Clinical Nutritionist | **Clinical Nutritionist** | 1 |
| 30 | Colorectal & Laparoscopic Surgeon | **Colorectal & Laparoscopic Surgeon** | 1 |
| 31 | Colorectal & Laparoscopic Surgeon → General Surgeon | **General Surgeon** | 2 |
| 32 | Colorectal & Laparoscopic Surgeon → General Surgeon → Colorectal Surgeon | **General Surgeon** | 3 |
| 33 | Colorectal & Laparoscopic Surgeon → Plastic Surgeon | **Plastic Surgeon** | 2 |
| 34 | Colorectal & Laparoscopic Surgeon → Surgeon | **Colorectal & Laparoscopic Surgeon** | 2 |
| 35 | Colorectal & Laparoscopic Surgery | **Colorectal & Laparoscopic Surgery** | 1 |
| 36 | Colorectal Surgeon | **Colorectal Surgeon** | 1 |
| 37 | Colorectal Surgeon → General Surgeon | **General Surgeon** | 2 |
| 38 | Colorectal Surgeon → General Surgeon → Laparoscopic Surgeon | **General Surgeon** | 3 |
| 39 | Cosmetologist → Dermatologist | **Dermatologist** | 2 |
| 40 | Critical Care Medicine Specialist | **Critical Care Medicine Specialist** | 1 |
| 41 | Critical Care Specialist | **Critical Care Specialist** | 1 |
| 42 | Dentist | **Dentist** | 1 |
| 43 | Dentist → Maxillofacial Surgeon | **Dentist** | 2 |
| 44 | Dermatologist | **Dermatologist** | 1 |
| 45 | Dermatologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 46 | Dermatologist → Medicine Specialist → Diabetologist | **Medicine Specialist** | 3 |
| 47 | Dermatologist → Venereologist | **Dermatologist** | 2 |
| 48 | Diabetes Specialist | **Diabetes Specialist** | 1 |
| 49 | Diabetes Specialist → Endocrinologist | **Endocrinologist** | 2 |
| 50 | Diabetes Specialist → Gynecologist & Obstetrician → Infertility Specialist | **Gynecologist & Obstetrician** | 3 |
| 51 | Diabetes Specialist → Medicine Specialist | **Medicine Specialist** | 2 |
| 52 | Diabetes Specialist → Medicine Specialist → Cardiologist | **Cardiologist** | 3 |
| 53 | Diabetes Specialist → Medicine Specialist → Endocrinologist | **Endocrinologist** | 3 |
| 54 | Diabetes Specialist → Medicine Specialist → Gastroenterologist | **Gastroenterologist** | 3 |
| 55 | Diabetes Specialist → Medicine Specialist → Rheumatologist | **Rheumatologist** | 3 |
| 56 | Diabetologist | **Diabetologist** | 1 |
| 57 | Diabetologist → Dermatologist | **Dermatologist** | 2 |
| 58 | Diabetologist → Endocrinologist | **Endocrinologist** | 2 |
| 59 | Diabetologist → Family Medicine Specialist | **Family Medicine Specialist** | 2 |
| 60 | Diabetologist → Internal Medicine | **Diabetologist** | 2 |
| 61 | Diabetologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 62 | Diabetologist → Medicine Specialist → Psychiatrist | **Medicine Specialist** | 3 |
| 63 | Diabetologist → Pulmonologist | **Pulmonologist** | 2 |
| 64 | Dietician | **Dietician** | 1 |
| 65 | Dietician → Nutritionist | **Dietician** | 2 |
| 66 | Endocrinologist | **Endocrinologist** | 1 |
| 67 | Endocrinologist → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 68 | Endocrinologist → Diabetologist | **Diabetologist** | 2 |
| 69 | Endocrinologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 70 | Epidemiologist → Internal Medicine Specialist | **Internal Medicine Specialist** | 2 |
| 71 | Family Medicine Specialist | **Family Medicine Specialist** | 1 |
| 72 | Family Medicine Specialist → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 73 | Family Medicine Specialist → Diabetologist | **Diabetologist** | 2 |
| 74 | Gastroenterologist | **Gastroenterologist** | 1 |
| 75 | Gastroenterologist → Hepatologist | **Hepatologist** | 2 |
| 76 | Gastroenterologist → Hepatologist → Medicine Specialist | **Hepatologist** | 3 |
| 77 | Gastroenterologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 78 | Gastroenterologist → Medicine Specialist → Diabetes Specialist | **Medicine Specialist** | 3 |
| 79 | Gastroenterologist → Medicine Specialist → Hepatologist | **Hepatologist** | 3 |
| 80 | General Physician | **General Physician** | 1 |
| 81 | General Physician → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 82 | General Physician → Diabetologist → Sonologist → Allergy Skin-VD | **Diabetologist** | 4 |
| 83 | General Physician → Family Medicine Specialist | **Family Medicine Specialist** | 2 |
| 84 | General Surgeon | **General Surgeon** | 1 |
| 85 | General Surgeon → Colorectal & Laparoscopic Surgeon | **Colorectal & Laparoscopic Surgeon** | 2 |
| 86 | General Surgeon → Colorectal & Laparoscopic Surgery | **General Surgeon** | 2 |
| 87 | General Surgeon → Colorectal Surgeon | **Colorectal Surgeon** | 2 |
| 88 | General Surgeon → Hepatobiliary Surgeon → Colorectal & Laparoscopic Surgeon | **Colorectal & Laparoscopic Surgeon** | 3 |
| 89 | General Surgeon → Hepatobiliary Surgeon → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 3 |
| 90 | General Surgeon → Hepatologist | **Hepatologist** | 2 |
| 91 | General Surgeon → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 2 |
| 92 | General Surgeon → Laparoscopic Surgeon → Colorectal Surgeon | **Laparoscopic Surgeon** | 3 |
| 93 | General Surgeon → Laparoscopic Surgeon → Plastic Surgeon | **Laparoscopic Surgeon** | 3 |
| 94 | General Surgeon → Laparoscopist | **General Surgeon** | 2 |
| 95 | General Surgeon → Plastic Surgeon | **Plastic Surgeon** | 2 |
| 96 | General Surgeon → Plastic Surgeon → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 3 |
| 97 | General Surgeon → Thoracic Surgeon | **Thoracic Surgeon** | 2 |
| 98 | General Surgeon → Vascular Surgeon | **Vascular Surgeon** | 2 |
| 99 | Gynecologic Oncologist | **Gynecologic Oncologist** | 1 |
| 100 | Gynecologic Oncologist → Gynecologist & Obstetrician | **Gynecologist & Obstetrician** | 2 |
| 101 | Gynecologist & Obstetrician | **Gynecologist & Obstetrician** | 1 |
| 102 | Gynecologist & Obstetrician → Gynecologic Oncologist | **Gynecologic Oncologist** | 2 |
| 103 | Gynecologist & Obstetrician → Infertility Specialist | **Infertility Specialist** | 2 |
| 104 | Gynecologist & Obstetrician → Infertility Specialist → Laparoscopic Surgeon | **Infertility Specialist** | 3 |
| 105 | Gynecologist & Obstetrician → Infertility Specialist → Surgeon | **Infertility Specialist** | 3 |
| 106 | Gynecologist & Obstetrician → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 2 |
| 107 | Gynecologist & Obstetrician → Laparoscopist | **Gynecologist & Obstetrician** | 2 |
| 108 | Gynecologist & Obstetrician → Surgeon | **Gynecologist & Obstetrician** | 2 |
| 109 | Gynecologists | **Gynecologists** | 1 |
| 110 | Gynecologists → Infertility Specialist | **Infertility Specialist** | 2 |
| 111 | Gynecologists → Infertility Specialist → Surgeon | **Infertility Specialist** | 3 |
| 112 | Hematologist | **Hematologist** | 1 |
| 113 | Hepatobiliary Surgeon | **Hepatobiliary Surgeon** | 1 |
| 114 | Hepatobiliary Surgeon → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 2 |
| 115 | Hepatobiliary Surgeon → Laparoscopic Surgeon → General Surgeon | **General Surgeon** | 3 |
| 116 | Hepatologist | **Hepatologist** | 1 |
| 117 | Hepatologist → Gastroenterologist | **Gastroenterologist** | 2 |
| 118 | Hepatologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 119 | Hepatologist → Surgeon | **Hepatologist** | 2 |
| 120 | Immunologist → Allergy Skin-VD | **Immunologist** | 2 |
| 121 | Infertility Specialist | **Infertility Specialist** | 1 |
| 122 | Infertility Specialist → Gynecologist & Obstetrician | **Gynecologist & Obstetrician** | 2 |
| 123 | Internal Medicine | **Internal Medicine** | 1 |
| 124 | Internal Medicine → Cardiologist | **Cardiologist** | 2 |
| 125 | Internal Medicine → Critical Care Specialist | **Internal Medicine** | 2 |
| 126 | Internal Medicine → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 127 | Internal Medicine → Hematologist | **Hematologist** | 2 |
| 128 | Internal Medicine → Nephrologist | **Nephrologist** | 2 |
| 129 | Internal Medicine → Rheumatologist | **Rheumatologist** | 2 |
| 130 | Internal Medicine Specialist | **Internal Medicine Specialist** | 1 |
| 131 | Internal Medicine Specialist → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 132 | Internal Medicine Specialist → Endocrinologist | **Endocrinologist** | 2 |
| 133 | Internal Medicine Specialist → Respiratory Specialist | **Internal Medicine Specialist** | 2 |
| 134 | Internal Medicine Specialist → Rheumatologist | **Rheumatologist** | 2 |
| 135 | Interventional Cardiologist | **Interventional Cardiologist** | 1 |
| 136 | Interventional Cardiologist → Thoracic Surgeon | **Thoracic Surgeon** | 2 |
| 137 | Laparoscopic Surgeon | **Laparoscopic Surgeon** | 1 |
| 138 | Laparoscopic Surgeon → Colorectal Surgeon | **Colorectal Surgeon** | 2 |
| 139 | Laparoscopic Surgeon → General Surgeon | **General Surgeon** | 2 |
| 140 | Laparoscopic Surgeon → Surgeon | **Laparoscopic Surgeon** | 2 |
| 141 | Laser Dermatosurgeon | **Laser Dermatosurgeon** | 1 |
| 142 | Maxillofacial Surgeon | **Maxillofacial Surgeon** | 1 |
| 143 | Maxillofacial Surgeon → Dentist | **Maxillofacial Surgeon** | 2 |
| 144 | Maxillofacial and Dental Surgeon | **Maxillofacial and Dental Surgeon** | 1 |
| 145 | Medicine Specialist | **Medicine Specialist** | 1 |
| 146 | Medicine Specialist → Cardiologist | **Cardiologist** | 2 |
| 147 | Medicine Specialist → Chest Specialist | **Medicine Specialist** | 2 |
| 148 | Medicine Specialist → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 149 | Medicine Specialist → Diabetologist | **Diabetologist** | 2 |
| 150 | Medicine Specialist → Diabetologist → Endocrinologist | **Endocrinologist** | 3 |
| 151 | Medicine Specialist → Endocrinologist | **Endocrinologist** | 2 |
| 152 | Medicine Specialist → Family Medicine Specialist | **Medicine Specialist** | 2 |
| 153 | Medicine Specialist → Gastroenterologist | **Gastroenterologist** | 2 |
| 154 | Medicine Specialist → Gastroenterologist → Diabetologist | **Gastroenterologist** | 3 |
| 155 | Medicine Specialist → General Physician | **Medicine Specialist** | 2 |
| 156 | Medicine Specialist → Gynecologists | **Gynecologists** | 2 |
| 157 | Medicine Specialist → Hematologist | **Hematologist** | 2 |
| 158 | Medicine Specialist → Hepatologist | **Hepatologist** | 2 |
| 159 | Medicine Specialist → Internal Medicine | **Medicine Specialist** | 2 |
| 160 | Medicine Specialist → Nephrologist | **Nephrologist** | 2 |
| 161 | Medicine Specialist → Nephrologist → Cardiologist | **Cardiologist** | 3 |
| 162 | Medicine Specialist → Nephrologist → Diabetes Specialist | **Nephrologist** | 3 |
| 163 | Medicine Specialist → Neurologist | **Neurologist** | 2 |
| 164 | Medicine Specialist → Neuromedicine Specialist | **Medicine Specialist** | 2 |
| 165 | Medicine Specialist → Neuromedicine Specialist → Diabetes Specialist | **Diabetes Specialist** | 3 |
| 166 | Medicine Specialist → Neuromedicine Specialist → Gastroenterologist | **Gastroenterologist** | 3 |
| 167 | Medicine Specialist → Oncologist | **Oncologist** | 2 |
| 168 | Medicine Specialist → Pain Management Specialist | **Medicine Specialist** | 2 |
| 169 | Medicine Specialist → Pediatric Nephrologist | **Pediatric Nephrologist** | 2 |
| 170 | Medicine Specialist → Pulmonologist | **Pulmonologist** | 2 |
| 171 | Medicine Specialist → Respiratory Specialist | **Medicine Specialist** | 2 |
| 172 | Medicine Specialist → Respiratory Specialist → Diabetes Specialist | **Diabetes Specialist** | 3 |
| 173 | Medicine Specialist → Rheumatologist | **Rheumatologist** | 2 |
| 174 | Medicine Specialist → Urologist → Rheumatologist | **Rheumatologist** | 3 |
| 175 | Neonatologist | **Neonatologist** | 1 |
| 176 | Neonatologist → Pediatric Surgeon | **Pediatric Surgeon** | 2 |
| 177 | Neonatologist → Pediatrician | **Pediatrician** | 2 |
| 178 | Nephrologist | **Nephrologist** | 1 |
| 179 | Nephrologist → Diabetes Specialist | **Diabetes Specialist** | 2 |
| 180 | Nephrologist → Diabetologist | **Diabetologist** | 2 |
| 181 | Nephrologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 182 | Neuro Physician | **Neuro Physician** | 1 |
| 183 | Neurologist | **Neurologist** | 1 |
| 184 | Neurologist → Anesthesiologist | **Neurologist** | 2 |
| 185 | Neurologist → Internal Medicine Specialist | **Internal Medicine Specialist** | 2 |
| 186 | Neurologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 187 | Neurologist → Neuromedicine Specialist | **Neurologist** | 2 |
| 188 | Neurologist → Neurosurgeon | **Neurosurgeon** | 2 |
| 189 | Neurologist → Pulmonologist | **Pulmonologist** | 2 |
| 190 | Neuromedicine Specialist | **Neuromedicine Specialist** | 1 |
| 191 | Neuromedicine Specialist → Medicine Specialist | **Medicine Specialist** | 2 |
| 192 | Neuromedicine Specialist → Respiratory Specialist | **Neuromedicine Specialist** | 2 |
| 193 | Neurosurgeon | **Neurosurgeon** | 1 |
| 194 | Neurosurgeon → Pediatric Neurosurgeon | **Pediatric Neurosurgeon** | 2 |
| 195 | Nucleologists → Medicine Specialist | **Medicine Specialist** | 2 |
| 196 | Nutritionist | **Nutritionist** | 1 |
| 197 | Obstetrician → Gynecologists | **Gynecologists** | 2 |
| 198 | Oncologist | **Oncologist** | 1 |
| 199 | Oncologist → General Surgeon | **General Surgeon** | 2 |
| 200 | Oncologist → Radiologist | **Oncologist** | 2 |
| 201 | Oncologist → Surgeon | **Oncologist** | 2 |
| 202 | Oncologist → Urologist → Laparoscopic Surgeon | **Urologist** | 3 |
| 203 | Ophthalmologist | **Ophthalmologist** | 1 |
| 204 | Ophthalmologist → Pediatrician | **Pediatrician** | 2 |
| 205 | Orthopedic Surgeon | **Orthopedic Surgeon** | 1 |
| 206 | Orthopedic Surgeon → Trauma Surgeon → Spine Surgeon | **Orthopedic Surgeon** | 3 |
| 207 | Orthopedist | **Orthopedist** | 1 |
| 208 | Orthopedist → Orthopedic Surgeon | **Orthopedic Surgeon** | 2 |
| 209 | Orthopedist → Spine Surgeon | **Orthopedist** | 2 |
| 210 | Orthopedist → Surgeon | **Orthopedist** | 2 |
| 211 | Otolaryngologists (ENT) | **Otolaryngologists (ENT)** | 1 |
| 212 | Otolaryngologists (ENT) → Oncologist | **Oncologist** | 2 |
| 213 | Otolaryngologists (ENT) → Surgeon | **Otolaryngologists (ENT)** | 2 |
| 214 | Pain Management Specialist | **Pain Management Specialist** | 1 |
| 215 | Pathologist | **Pathologist** | 1 |
| 216 | Pediatric Cardiologist | **Pediatric Cardiologist** | 1 |
| 217 | Pediatric Endocrinologist → Pediatrician | **Pediatric Endocrinologist** | 2 |
| 218 | Pediatric Gastroenterologist | **Pediatric Gastroenterologist** | 1 |
| 219 | Pediatric Hematologist | **Pediatric Hematologist** | 1 |
| 220 | Pediatric Hematologist → Oncologist | **Oncologist** | 2 |
| 221 | Pediatric Hematologist & Oncologist | **Pediatric Hematologist & Oncologist** | 1 |
| 222 | Pediatric Nephrologist | **Pediatric Nephrologist** | 1 |
| 223 | Pediatric Neurologist | **Pediatric Neurologist** | 1 |
| 224 | Pediatric Neurosurgeon | **Pediatric Neurosurgeon** | 1 |
| 225 | Pediatric Pulmonologist | **Pediatric Pulmonologist** | 1 |
| 226 | Pediatric Surgeon | **Pediatric Surgeon** | 1 |
| 227 | Pediatric Surgeon → Orthopedist | **Pediatric Surgeon** | 2 |
| 228 | Pediatrician | **Pediatrician** | 1 |
| 229 | Pediatrician → Hematologist | **Hematologist** | 2 |
| 230 | Pediatrician → Medicine Specialist | **Medicine Specialist** | 2 |
| 231 | Pediatrician → Neonatologist | **Pediatrician** | 2 |
| 232 | Pediatrician → Nutritionist | **Pediatrician** | 2 |
| 233 | Pediatrician → Ophthalmologist | **Pediatrician** | 2 |
| 234 | Pediatrician → Orthopedist | **Pediatrician** | 2 |
| 235 | Pediatrician → Pediatric Cardiologist | **Pediatric Cardiologist** | 2 |
| 236 | Pediatrician → Pediatric Gastroenterologist | **Pediatric Gastroenterologist** | 2 |
| 237 | Pediatrician → Pediatric Hematologist | **Pediatric Hematologist** | 2 |
| 238 | Pediatrician → Pediatric Hematologist & Oncologist | **Pediatric Hematologist & Oncologist** | 2 |
| 239 | Pediatrician → Pediatric Nephrologist | **Pediatric Nephrologist** | 2 |
| 240 | Pediatrician → Pediatric Neurologist | **Pediatric Neurologist** | 2 |
| 241 | Pediatrician → Pediatric Pulmonologist | **Pediatric Pulmonologist** | 2 |
| 242 | Pediatrician → Pediatrician & Neonatologist | **Pediatrician** | 2 |
| 243 | Pediatrician → Psychiatrist | **Pediatrician** | 2 |
| 244 | Pediatrician → Pulmonologist | **Pulmonologist** | 2 |
| 245 | Pediatrician & Neonatologist | **Pediatrician & Neonatologist** | 1 |
| 246 | Pediatrician & Neonatologist → Nutritionist | **Pediatrician & Neonatologist** | 2 |
| 247 | Physical Medicine | **Physical Medicine** | 1 |
| 248 | Physical Medicine → Pain Management Specialist | **Physical Medicine** | 2 |
| 249 | Physical Medicine → Rehabilitation Specialist | **Physical Medicine** | 2 |
| 250 | Physical Medicine → Rheumatologist | **Rheumatologist** | 2 |
| 251 | Physiotherapist | **Physiotherapist** | 1 |
| 252 | Physiotherapist → Rehabilitation Specialist | **Physiotherapist** | 2 |
| 253 | Plastic Surgeon | **Plastic Surgeon** | 1 |
| 254 | Psychiatrist | **Psychiatrist** | 1 |
| 255 | Psychologist | **Psychologist** | 1 |
| 256 | Pulmonary Medicine Specialist | **Pulmonary Medicine Specialist** | 1 |
| 257 | Pulmonologist | **Pulmonologist** | 1 |
| 258 | Pulmonologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 259 | Pulmonologist → Respiratory Specialist | **Pulmonologist** | 2 |
| 260 | Radiologist | **Radiologist** | 1 |
| 261 | Radiologist → Oncologist | **Oncologist** | 2 |
| 262 | Rehabilitation Specialist | **Rehabilitation Specialist** | 1 |
| 263 | Respiratory Specialist | **Respiratory Specialist** | 1 |
| 264 | Respiratory Specialist → Chest Specialist | **Respiratory Specialist** | 2 |
| 265 | Respiratory Specialist → Dermatologist | **Dermatologist** | 2 |
| 266 | Respiratory Specialist → Internal Medicine | **Respiratory Specialist** | 2 |
| 267 | Respiratory Specialist → Internal Medicine Specialist | **Internal Medicine Specialist** | 2 |
| 268 | Respiratory Specialist → Medicine Specialist | **Medicine Specialist** | 2 |
| 269 | Rheumatologist | **Rheumatologist** | 1 |
| 270 | Rheumatologist → Medicine Specialist | **Medicine Specialist** | 2 |
| 271 | Sonologist | **Sonologist** | 1 |
| 272 | Surgeon | **Surgeon** | 1 |
| 273 | Surgeon → Colorectal Surgeon → General Surgeon → Oncologist → Laparoscopic Surgeon | **Oncologist** | 5 |
| 274 | Surgeon → Hepatobiliary Surgeon → Colorectal & Laparoscopic Surgeon | **Colorectal & Laparoscopic Surgeon** | 3 |
| 275 | Surgeon → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 2 |
| 276 | Surgeon → Urologist | **Urologist** | 2 |
| 277 | Thoracic Surgeon | **Thoracic Surgeon** | 1 |
| 278 | Thoracic Surgeon → Cardiac Surgeon → Vascular Surgeon | **Cardiac Surgeon** | 3 |
| 279 | Thoracic Surgeon → Cardiothoracic Surgeon | **Cardiothoracic Surgeon** | 2 |
| 280 | Transfusion Medicine Specialist | **Transfusion Medicine Specialist** | 1 |
| 281 | Trauma Surgeon → Orthopedist | **Trauma Surgeon** | 2 |
| 282 | Urologist | **Urologist** | 1 |
| 283 | Urologist → General Surgeon | **General Surgeon** | 2 |
| 284 | Urologist → Laparoscopic Surgeon | **Laparoscopic Surgeon** | 2 |
| 285 | Urologist → Surgeon | **Urologist** | 2 |
| 286 | Vascular Surgeon | **Vascular Surgeon** | 1 |
| 287 | Vascular Surgeon → General Surgeon | **General Surgeon** | 2 |
| 288 | Vascular Surgeon → Thoracic Surgeon → Cardiac Surgeon | **Cardiac Surgeon** | 3 |


---

## Detailed Normalization Breakdown

Below is the complete list showing each original specialty entry with its normalized form and all subspecialties.

### 1. Allergy Skin-VD

**Original Entry:**
```
Allergy Skin-VD
Laser Dermatosurgeon
```

**Subspecialties:**
- Allergy Skin-VD
- Laser Dermatosurgeon

---

### 2. Dermatologist

**Original Entry:**
```
Allergy Skin-VD
Sexual Medicine Specialist
Dermatologist
```

**Subspecialties:**
- Allergy Skin-VD
- Sexual Medicine Specialist
- Dermatologist

---

### 3. Anesthesiologist

**Original Entry:**
```
Anesthesiologist
```

**Type:** Single Specialty

---

### 4. Anesthesiologist

**Original Entry:**
```
Anesthesiologist
Critical Care Specialist
```

**Subspecialties:**
- Anesthesiologist
- Critical Care Specialist

---

### 5. Cardiac Surgeon

**Original Entry:**
```
Cardiac Surgeon
```

**Type:** Single Specialty

---

### 6. Cardiothoracic and Vascular Surgeon

**Original Entry:**
```
Cardiac Surgeon
Cardiothoracic and Vascular Surgeon
```

**Subspecialties:**
- Cardiac Surgeon
- Cardiothoracic and Vascular Surgeon

---

### 7. Pediatric Cardiologist

**Original Entry:**
```
Cardiac Surgeon
Pediatric Cardiologist
```

**Subspecialties:**
- Cardiac Surgeon
- Pediatric Cardiologist

---

### 8. Cardiologist

**Original Entry:**
```
Cardiologist
```

**Type:** Single Specialty

---

### 9. Cardiac Surgeon

**Original Entry:**
```
Cardiologist
Cardiac Surgeon
```

**Subspecialties:**
- Cardiologist
- Cardiac Surgeon

---

### 10. Cardiothoracic and Vascular Surgeon

**Original Entry:**
```
Cardiologist
Cardiothoracic and Vascular Surgeon
```

**Subspecialties:**
- Cardiologist
- Cardiothoracic and Vascular Surgeon

---

### 11. Medicine Specialist

**Original Entry:**
```
Cardiologist
Diabetes Specialist
Medicine Specialist
```

**Subspecialties:**
- Cardiologist
- Diabetes Specialist
- Medicine Specialist

---

### 12. Diabetologist

**Original Entry:**
```
Cardiologist
Diabetologist
```

**Subspecialties:**
- Cardiologist
- Diabetologist

---

### 13. Medicine Specialist

**Original Entry:**
```
Cardiologist
Medicine Specialist
```

**Subspecialties:**
- Cardiologist
- Medicine Specialist

---

### 14. Medicine Specialist

**Original Entry:**
```
Cardiologist
Medicine Specialist
Diabetes Specialist
```

**Subspecialties:**
- Cardiologist
- Medicine Specialist
- Diabetes Specialist

---

### 15. Medicine Specialist

**Original Entry:**
```
Cardiologist
Medicine Specialist
Respiratory Specialist
Diabetes Specialist
```

**Subspecialties:**
- Cardiologist
- Medicine Specialist
- Respiratory Specialist
- Diabetes Specialist

---

### 16. Rheumatologist

**Original Entry:**
```
Cardiologist
Medicine Specialist
Rheumatologist
```

**Subspecialties:**
- Cardiologist
- Medicine Specialist
- Rheumatologist

---

### 17. Pediatric Cardiologist

**Original Entry:**
```
Cardiologist
Pediatric Cardiologist
```

**Subspecialties:**
- Cardiologist
- Pediatric Cardiologist

---

### 18. Pulmonologist

**Original Entry:**
```
Cardiologist
Pulmonologist
```

**Subspecialties:**
- Cardiologist
- Pulmonologist

---

### 19. Rheumatologist

**Original Entry:**
```
Cardiologist
Rheumatologist
Diabetes Specialist
```

**Subspecialties:**
- Cardiologist
- Rheumatologist
- Diabetes Specialist

---

### 20. Cardiothoracic Surgeon

**Original Entry:**
```
Cardiothoracic Surgeon
```

**Type:** Single Specialty

---

### 21. Thoracic Surgeon

**Original Entry:**
```
Cardiothoracic Surgeon
Thoracic Surgeon
```

**Subspecialties:**
- Cardiothoracic Surgeon
- Thoracic Surgeon

---

### 22. Cardiothoracic and Vascular Surgeon

**Original Entry:**
```
Cardiothoracic and Vascular Surgeon
```

**Type:** Single Specialty

---

### 23. Thoracic Surgeon

**Original Entry:**
```
Cardiothoracic and Vascular Surgeon
Thoracic Surgeon
```

**Subspecialties:**
- Cardiothoracic and Vascular Surgeon
- Thoracic Surgeon

---

### 24. Chest Specialist

**Original Entry:**
```
Chest Specialist
```

**Type:** Single Specialty

---

### 25. Medicine Specialist

**Original Entry:**
```
Chest Specialist
Diabetes Specialist
Medicine Specialist
```

**Subspecialties:**
- Chest Specialist
- Diabetes Specialist
- Medicine Specialist

---

### 26. Medicine Specialist

**Original Entry:**
```
Chest Specialist
Medicine Specialist
```

**Subspecialties:**
- Chest Specialist
- Medicine Specialist

---

### 27. Pulmonologist

**Original Entry:**
```
Chest Specialist
Pulmonologist
```

**Subspecialties:**
- Chest Specialist
- Pulmonologist

---

### 28. Chest Specialist

**Original Entry:**
```
Chest Specialist
Respiratory Specialist
```

**Subspecialties:**
- Chest Specialist
- Respiratory Specialist

---

### 29. Clinical Nutritionist

**Original Entry:**
```
Clinical Nutritionist
```

**Type:** Single Specialty

---

### 30. Colorectal & Laparoscopic Surgeon

**Original Entry:**
```
Colorectal & Laparoscopic Surgeon
```

**Type:** Single Specialty

---

### 31. General Surgeon

**Original Entry:**
```
Colorectal & Laparoscopic Surgeon
General Surgeon
```

**Subspecialties:**
- Colorectal & Laparoscopic Surgeon
- General Surgeon

---

### 32. General Surgeon

**Original Entry:**
```
Colorectal & Laparoscopic Surgeon
General Surgeon
Colorectal Surgeon
```

**Subspecialties:**
- Colorectal & Laparoscopic Surgeon
- General Surgeon
- Colorectal Surgeon

---

### 33. Plastic Surgeon

**Original Entry:**
```
Colorectal & Laparoscopic Surgeon
Plastic Surgeon
```

**Subspecialties:**
- Colorectal & Laparoscopic Surgeon
- Plastic Surgeon

---

### 34. Colorectal & Laparoscopic Surgeon

**Original Entry:**
```
Colorectal & Laparoscopic Surgeon
Surgeon
```

**Subspecialties:**
- Colorectal & Laparoscopic Surgeon
- Surgeon

---

### 35. Colorectal & Laparoscopic Surgery

**Original Entry:**
```
Colorectal & Laparoscopic Surgery
```

**Type:** Single Specialty

---

### 36. Colorectal Surgeon

**Original Entry:**
```
Colorectal Surgeon
```

**Type:** Single Specialty

---

### 37. General Surgeon

**Original Entry:**
```
Colorectal Surgeon
General Surgeon
```

**Subspecialties:**
- Colorectal Surgeon
- General Surgeon

---

### 38. General Surgeon

**Original Entry:**
```
Colorectal Surgeon
General Surgeon
Laparoscopic Surgeon
```

**Subspecialties:**
- Colorectal Surgeon
- General Surgeon
- Laparoscopic Surgeon

---

### 39. Dermatologist

**Original Entry:**
```
Cosmetologist
Dermatologist
```

**Subspecialties:**
- Cosmetologist
- Dermatologist

---

### 40. Critical Care Medicine Specialist

**Original Entry:**
```
Critical Care Medicine Specialist
```

**Type:** Single Specialty

---

### 41. Critical Care Specialist

**Original Entry:**
```
Critical Care Specialist
```

**Type:** Single Specialty

---

### 42. Dentist

**Original Entry:**
```
Dentist
```

**Type:** Single Specialty

---

### 43. Dentist

**Original Entry:**
```
Dentist
Maxillofacial Surgeon
```

**Subspecialties:**
- Dentist
- Maxillofacial Surgeon

---

### 44. Dermatologist

**Original Entry:**
```
Dermatologist
```

**Type:** Single Specialty

---

### 45. Medicine Specialist

**Original Entry:**
```
Dermatologist
Medicine Specialist
```

**Subspecialties:**
- Dermatologist
- Medicine Specialist

---

### 46. Medicine Specialist

**Original Entry:**
```
Dermatologist
Medicine Specialist
Diabetologist
```

**Subspecialties:**
- Dermatologist
- Medicine Specialist
- Diabetologist

---

### 47. Dermatologist

**Original Entry:**
```
Dermatologist
Venereologist
```

**Subspecialties:**
- Dermatologist
- Venereologist

---

### 48. Diabetes Specialist

**Original Entry:**
```
Diabetes Specialist
```

**Type:** Single Specialty

---

### 49. Endocrinologist

**Original Entry:**
```
Diabetes Specialist
Endocrinologist
```

**Subspecialties:**
- Diabetes Specialist
- Endocrinologist

---

### 50. Gynecologist & Obstetrician

**Original Entry:**
```
Diabetes Specialist
Gynecologist & Obstetrician
Infertility Specialist
```

**Subspecialties:**
- Diabetes Specialist
- Gynecologist & Obstetrician
- Infertility Specialist

---

### 51. Medicine Specialist

**Original Entry:**
```
Diabetes Specialist
Medicine Specialist
```

**Subspecialties:**
- Diabetes Specialist
- Medicine Specialist

---

### 52. Cardiologist

**Original Entry:**
```
Diabetes Specialist
Medicine Specialist
Cardiologist
```

**Subspecialties:**
- Diabetes Specialist
- Medicine Specialist
- Cardiologist

---

### 53. Endocrinologist

**Original Entry:**
```
Diabetes Specialist
Medicine Specialist
Endocrinologist
```

**Subspecialties:**
- Diabetes Specialist
- Medicine Specialist
- Endocrinologist

---

### 54. Gastroenterologist

**Original Entry:**
```
Diabetes Specialist
Medicine Specialist
Gastroenterologist
```

**Subspecialties:**
- Diabetes Specialist
- Medicine Specialist
- Gastroenterologist

---

### 55. Rheumatologist

**Original Entry:**
```
Diabetes Specialist
Medicine Specialist
Rheumatologist
```

**Subspecialties:**
- Diabetes Specialist
- Medicine Specialist
- Rheumatologist

---

### 56. Diabetologist

**Original Entry:**
```
Diabetologist
```

**Type:** Single Specialty

---

### 57. Dermatologist

**Original Entry:**
```
Diabetologist
Dermatologist
```

**Subspecialties:**
- Diabetologist
- Dermatologist

---

### 58. Endocrinologist

**Original Entry:**
```
Diabetologist
Endocrinologist
```

**Subspecialties:**
- Diabetologist
- Endocrinologist

---

### 59. Family Medicine Specialist

**Original Entry:**
```
Diabetologist
Family Medicine Specialist
```

**Subspecialties:**
- Diabetologist
- Family Medicine Specialist

---

### 60. Diabetologist

**Original Entry:**
```
Diabetologist
Internal Medicine
```

**Subspecialties:**
- Diabetologist
- Internal Medicine

---

### 61. Medicine Specialist

**Original Entry:**
```
Diabetologist
Medicine Specialist
```

**Subspecialties:**
- Diabetologist
- Medicine Specialist

---

### 62. Medicine Specialist

**Original Entry:**
```
Diabetologist
Medicine Specialist
Psychiatrist
```

**Subspecialties:**
- Diabetologist
- Medicine Specialist
- Psychiatrist

---

### 63. Pulmonologist

**Original Entry:**
```
Diabetologist
Pulmonologist
```

**Subspecialties:**
- Diabetologist
- Pulmonologist

---

### 64. Dietician

**Original Entry:**
```
Dietician
```

**Type:** Single Specialty

---

### 65. Dietician

**Original Entry:**
```
Dietician
Nutritionist
```

**Subspecialties:**
- Dietician
- Nutritionist

---

### 66. Endocrinologist

**Original Entry:**
```
Endocrinologist
```

**Type:** Single Specialty

---

### 67. Diabetes Specialist

**Original Entry:**
```
Endocrinologist
Diabetes Specialist
```

**Subspecialties:**
- Endocrinologist
- Diabetes Specialist

---

### 68. Diabetologist

**Original Entry:**
```
Endocrinologist
Diabetologist
```

**Subspecialties:**
- Endocrinologist
- Diabetologist

---

### 69. Medicine Specialist

**Original Entry:**
```
Endocrinologist
Medicine Specialist
```

**Subspecialties:**
- Endocrinologist
- Medicine Specialist

---

### 70. Internal Medicine Specialist

**Original Entry:**
```
Epidemiologist
Internal Medicine Specialist
```

**Subspecialties:**
- Epidemiologist
- Internal Medicine Specialist

---

### 71. Family Medicine Specialist

**Original Entry:**
```
Family Medicine Specialist
```

**Type:** Single Specialty

---

### 72. Diabetes Specialist

**Original Entry:**
```
Family Medicine Specialist
Diabetes Specialist
```

**Subspecialties:**
- Family Medicine Specialist
- Diabetes Specialist

---

### 73. Diabetologist

**Original Entry:**
```
Family Medicine Specialist
Diabetologist
```

**Subspecialties:**
- Family Medicine Specialist
- Diabetologist

---

### 74. Gastroenterologist

**Original Entry:**
```
Gastroenterologist
```

**Type:** Single Specialty

---

### 75. Hepatologist

**Original Entry:**
```
Gastroenterologist
Hepatologist
```

**Subspecialties:**
- Gastroenterologist
- Hepatologist

---

### 76. Hepatologist

**Original Entry:**
```
Gastroenterologist
Hepatologist
Medicine Specialist
```

**Subspecialties:**
- Gastroenterologist
- Hepatologist
- Medicine Specialist

---

### 77. Medicine Specialist

**Original Entry:**
```
Gastroenterologist
Medicine Specialist
```

**Subspecialties:**
- Gastroenterologist
- Medicine Specialist

---

### 78. Medicine Specialist

**Original Entry:**
```
Gastroenterologist
Medicine Specialist
Diabetes Specialist
```

**Subspecialties:**
- Gastroenterologist
- Medicine Specialist
- Diabetes Specialist

---

### 79. Hepatologist

**Original Entry:**
```
Gastroenterologist
Medicine Specialist
Hepatologist
```

**Subspecialties:**
- Gastroenterologist
- Medicine Specialist
- Hepatologist

---

### 80. General Physician

**Original Entry:**
```
General Physician
```

**Type:** Single Specialty

---

### 81. Diabetes Specialist

**Original Entry:**
```
General Physician
Diabetes Specialist
```

**Subspecialties:**
- General Physician
- Diabetes Specialist

---

### 82. Diabetologist

**Original Entry:**
```
General Physician
Diabetologist
Sonologist
Allergy Skin-VD
```

**Subspecialties:**
- General Physician
- Diabetologist
- Sonologist
- Allergy Skin-VD

---

### 83. Family Medicine Specialist

**Original Entry:**
```
General Physician
Family Medicine Specialist
```

**Subspecialties:**
- General Physician
- Family Medicine Specialist

---

### 84. General Surgeon

**Original Entry:**
```
General Surgeon
```

**Type:** Single Specialty

---

### 85. Colorectal & Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Colorectal & Laparoscopic Surgeon
```

**Subspecialties:**
- General Surgeon
- Colorectal & Laparoscopic Surgeon

---

### 86. General Surgeon

**Original Entry:**
```
General Surgeon
Colorectal & Laparoscopic Surgery
```

**Subspecialties:**
- General Surgeon
- Colorectal & Laparoscopic Surgery

---

### 87. Colorectal Surgeon

**Original Entry:**
```
General Surgeon
Colorectal Surgeon
```

**Subspecialties:**
- General Surgeon
- Colorectal Surgeon

---

### 88. Colorectal & Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Hepatobiliary Surgeon
Colorectal & Laparoscopic Surgeon
```

**Subspecialties:**
- General Surgeon
- Hepatobiliary Surgeon
- Colorectal & Laparoscopic Surgeon

---

### 89. Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Hepatobiliary Surgeon
Laparoscopic Surgeon
```

**Subspecialties:**
- General Surgeon
- Hepatobiliary Surgeon
- Laparoscopic Surgeon

---

### 90. Hepatologist

**Original Entry:**
```
General Surgeon
Hepatologist
```

**Subspecialties:**
- General Surgeon
- Hepatologist

---

### 91. Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Laparoscopic Surgeon
```

**Subspecialties:**
- General Surgeon
- Laparoscopic Surgeon

---

### 92. Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Laparoscopic Surgeon
Colorectal Surgeon
```

**Subspecialties:**
- General Surgeon
- Laparoscopic Surgeon
- Colorectal Surgeon

---

### 93. Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Laparoscopic Surgeon
Plastic Surgeon
```

**Subspecialties:**
- General Surgeon
- Laparoscopic Surgeon
- Plastic Surgeon

---

### 94. General Surgeon

**Original Entry:**
```
General Surgeon
Laparoscopist
```

**Subspecialties:**
- General Surgeon
- Laparoscopist

---

### 95. Plastic Surgeon

**Original Entry:**
```
General Surgeon
Plastic Surgeon
```

**Subspecialties:**
- General Surgeon
- Plastic Surgeon

---

### 96. Laparoscopic Surgeon

**Original Entry:**
```
General Surgeon
Plastic Surgeon
Laparoscopic Surgeon
```

**Subspecialties:**
- General Surgeon
- Plastic Surgeon
- Laparoscopic Surgeon

---

### 97. Thoracic Surgeon

**Original Entry:**
```
General Surgeon
Thoracic Surgeon
```

**Subspecialties:**
- General Surgeon
- Thoracic Surgeon

---

### 98. Vascular Surgeon

**Original Entry:**
```
General Surgeon
Vascular Surgeon
```

**Subspecialties:**
- General Surgeon
- Vascular Surgeon

---

### 99. Gynecologic Oncologist

**Original Entry:**
```
Gynecologic Oncologist
```

**Type:** Single Specialty

---

### 100. Gynecologist & Obstetrician

**Original Entry:**
```
Gynecologic Oncologist
Gynecologist & Obstetrician
```

**Subspecialties:**
- Gynecologic Oncologist
- Gynecologist & Obstetrician

---

### 101. Gynecologist & Obstetrician

**Original Entry:**
```
Gynecologist & Obstetrician
```

**Type:** Single Specialty

---

### 102. Gynecologic Oncologist

**Original Entry:**
```
Gynecologist & Obstetrician
Gynecologic Oncologist
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Gynecologic Oncologist

---

### 103. Infertility Specialist

**Original Entry:**
```
Gynecologist & Obstetrician
Infertility Specialist
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Infertility Specialist

---

### 104. Infertility Specialist

**Original Entry:**
```
Gynecologist & Obstetrician
Infertility Specialist
Laparoscopic Surgeon
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Infertility Specialist
- Laparoscopic Surgeon

---

### 105. Infertility Specialist

**Original Entry:**
```
Gynecologist & Obstetrician
Infertility Specialist
Surgeon
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Infertility Specialist
- Surgeon

---

### 106. Laparoscopic Surgeon

**Original Entry:**
```
Gynecologist & Obstetrician
Laparoscopic Surgeon
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Laparoscopic Surgeon

---

### 107. Gynecologist & Obstetrician

**Original Entry:**
```
Gynecologist & Obstetrician
Laparoscopist
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Laparoscopist

---

### 108. Gynecologist & Obstetrician

**Original Entry:**
```
Gynecologist & Obstetrician
Surgeon
```

**Subspecialties:**
- Gynecologist & Obstetrician
- Surgeon

---

### 109. Gynecologists

**Original Entry:**
```
Gynecologists
```

**Type:** Single Specialty

---

### 110. Infertility Specialist

**Original Entry:**
```
Gynecologists
Infertility Specialist
```

**Subspecialties:**
- Gynecologists
- Infertility Specialist

---

### 111. Infertility Specialist

**Original Entry:**
```
Gynecologists
Infertility Specialist
Surgeon
```

**Subspecialties:**
- Gynecologists
- Infertility Specialist
- Surgeon

---

### 112. Hematologist

**Original Entry:**
```
Hematologist
```

**Type:** Single Specialty

---

### 113. Hepatobiliary Surgeon

**Original Entry:**
```
Hepatobiliary Surgeon
```

**Type:** Single Specialty

---

### 114. Laparoscopic Surgeon

**Original Entry:**
```
Hepatobiliary Surgeon
Laparoscopic Surgeon
```

**Subspecialties:**
- Hepatobiliary Surgeon
- Laparoscopic Surgeon

---

### 115. General Surgeon

**Original Entry:**
```
Hepatobiliary Surgeon
Laparoscopic Surgeon
General Surgeon
```

**Subspecialties:**
- Hepatobiliary Surgeon
- Laparoscopic Surgeon
- General Surgeon

---

### 116. Hepatologist

**Original Entry:**
```
Hepatologist
```

**Type:** Single Specialty

---

### 117. Gastroenterologist

**Original Entry:**
```
Hepatologist
Gastroenterologist
```

**Subspecialties:**
- Hepatologist
- Gastroenterologist

---

### 118. Medicine Specialist

**Original Entry:**
```
Hepatologist
Medicine Specialist
```

**Subspecialties:**
- Hepatologist
- Medicine Specialist

---

### 119. Hepatologist

**Original Entry:**
```
Hepatologist
Surgeon
```

**Subspecialties:**
- Hepatologist
- Surgeon

---

### 120. Immunologist

**Original Entry:**
```
Immunologist
Allergy Skin-VD
```

**Subspecialties:**
- Immunologist
- Allergy Skin-VD

---

### 121. Infertility Specialist

**Original Entry:**
```
Infertility Specialist
```

**Type:** Single Specialty

---

### 122. Gynecologist & Obstetrician

**Original Entry:**
```
Infertility Specialist
Gynecologist & Obstetrician
```

**Subspecialties:**
- Infertility Specialist
- Gynecologist & Obstetrician

---

### 123. Internal Medicine

**Original Entry:**
```
Internal Medicine
```

**Type:** Single Specialty

---

### 124. Cardiologist

**Original Entry:**
```
Internal Medicine
Cardiologist
```

**Subspecialties:**
- Internal Medicine
- Cardiologist

---

### 125. Internal Medicine

**Original Entry:**
```
Internal Medicine
Critical Care Specialist
```

**Subspecialties:**
- Internal Medicine
- Critical Care Specialist

---

### 126. Diabetes Specialist

**Original Entry:**
```
Internal Medicine
Diabetes Specialist
```

**Subspecialties:**
- Internal Medicine
- Diabetes Specialist

---

### 127. Hematologist

**Original Entry:**
```
Internal Medicine
Hematologist
```

**Subspecialties:**
- Internal Medicine
- Hematologist

---

### 128. Nephrologist

**Original Entry:**
```
Internal Medicine
Nephrologist
```

**Subspecialties:**
- Internal Medicine
- Nephrologist

---

### 129. Rheumatologist

**Original Entry:**
```
Internal Medicine
Rheumatologist
```

**Subspecialties:**
- Internal Medicine
- Rheumatologist

---

### 130. Internal Medicine Specialist

**Original Entry:**
```
Internal Medicine Specialist
```

**Type:** Single Specialty

---

### 131. Diabetes Specialist

**Original Entry:**
```
Internal Medicine Specialist
Diabetes Specialist
```

**Subspecialties:**
- Internal Medicine Specialist
- Diabetes Specialist

---

### 132. Endocrinologist

**Original Entry:**
```
Internal Medicine Specialist
Endocrinologist
```

**Subspecialties:**
- Internal Medicine Specialist
- Endocrinologist

---

### 133. Internal Medicine Specialist

**Original Entry:**
```
Internal Medicine Specialist
Respiratory Specialist
```

**Subspecialties:**
- Internal Medicine Specialist
- Respiratory Specialist

---

### 134. Rheumatologist

**Original Entry:**
```
Internal Medicine Specialist
Rheumatologist
```

**Subspecialties:**
- Internal Medicine Specialist
- Rheumatologist

---

### 135. Interventional Cardiologist

**Original Entry:**
```
Interventional Cardiologist
```

**Type:** Single Specialty

---

### 136. Thoracic Surgeon

**Original Entry:**
```
Interventional Cardiologist
Thoracic Surgeon
```

**Subspecialties:**
- Interventional Cardiologist
- Thoracic Surgeon

---

### 137. Laparoscopic Surgeon

**Original Entry:**
```
Laparoscopic Surgeon
```

**Type:** Single Specialty

---

### 138. Colorectal Surgeon

**Original Entry:**
```
Laparoscopic Surgeon
Colorectal Surgeon
```

**Subspecialties:**
- Laparoscopic Surgeon
- Colorectal Surgeon

---

### 139. General Surgeon

**Original Entry:**
```
Laparoscopic Surgeon
General Surgeon
```

**Subspecialties:**
- Laparoscopic Surgeon
- General Surgeon

---

### 140. Laparoscopic Surgeon

**Original Entry:**
```
Laparoscopic Surgeon
Surgeon
```

**Subspecialties:**
- Laparoscopic Surgeon
- Surgeon

---

### 141. Laser Dermatosurgeon

**Original Entry:**
```
Laser Dermatosurgeon
```

**Type:** Single Specialty

---

### 142. Maxillofacial Surgeon

**Original Entry:**
```
Maxillofacial Surgeon
```

**Type:** Single Specialty

---

### 143. Maxillofacial Surgeon

**Original Entry:**
```
Maxillofacial Surgeon
Dentist
```

**Subspecialties:**
- Maxillofacial Surgeon
- Dentist

---

### 144. Maxillofacial and Dental Surgeon

**Original Entry:**
```
Maxillofacial and Dental Surgeon
```

**Type:** Single Specialty

---

### 145. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
```

**Type:** Single Specialty

---

### 146. Cardiologist

**Original Entry:**
```
Medicine Specialist
Cardiologist
```

**Subspecialties:**
- Medicine Specialist
- Cardiologist

---

### 147. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
Chest Specialist
```

**Subspecialties:**
- Medicine Specialist
- Chest Specialist

---

### 148. Diabetes Specialist

**Original Entry:**
```
Medicine Specialist
Diabetes Specialist
```

**Subspecialties:**
- Medicine Specialist
- Diabetes Specialist

---

### 149. Diabetologist

**Original Entry:**
```
Medicine Specialist
Diabetologist
```

**Subspecialties:**
- Medicine Specialist
- Diabetologist

---

### 150. Endocrinologist

**Original Entry:**
```
Medicine Specialist
Diabetologist
Endocrinologist
```

**Subspecialties:**
- Medicine Specialist
- Diabetologist
- Endocrinologist

---

### 151. Endocrinologist

**Original Entry:**
```
Medicine Specialist
Endocrinologist
```

**Subspecialties:**
- Medicine Specialist
- Endocrinologist

---

### 152. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
Family Medicine Specialist
```

**Subspecialties:**
- Medicine Specialist
- Family Medicine Specialist

---

### 153. Gastroenterologist

**Original Entry:**
```
Medicine Specialist
Gastroenterologist
```

**Subspecialties:**
- Medicine Specialist
- Gastroenterologist

---

### 154. Gastroenterologist

**Original Entry:**
```
Medicine Specialist
Gastroenterologist
Diabetologist
```

**Subspecialties:**
- Medicine Specialist
- Gastroenterologist
- Diabetologist

---

### 155. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
General Physician
```

**Subspecialties:**
- Medicine Specialist
- General Physician

---

### 156. Gynecologists

**Original Entry:**
```
Medicine Specialist
Gynecologists
```

**Subspecialties:**
- Medicine Specialist
- Gynecologists

---

### 157. Hematologist

**Original Entry:**
```
Medicine Specialist
Hematologist
```

**Subspecialties:**
- Medicine Specialist
- Hematologist

---

### 158. Hepatologist

**Original Entry:**
```
Medicine Specialist
Hepatologist
```

**Subspecialties:**
- Medicine Specialist
- Hepatologist

---

### 159. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
Internal Medicine
```

**Subspecialties:**
- Medicine Specialist
- Internal Medicine

---

### 160. Nephrologist

**Original Entry:**
```
Medicine Specialist
Nephrologist
```

**Subspecialties:**
- Medicine Specialist
- Nephrologist

---

### 161. Cardiologist

**Original Entry:**
```
Medicine Specialist
Nephrologist
Cardiologist
```

**Subspecialties:**
- Medicine Specialist
- Nephrologist
- Cardiologist

---

### 162. Nephrologist

**Original Entry:**
```
Medicine Specialist
Nephrologist
Diabetes Specialist
```

**Subspecialties:**
- Medicine Specialist
- Nephrologist
- Diabetes Specialist

---

### 163. Neurologist

**Original Entry:**
```
Medicine Specialist
Neurologist
```

**Subspecialties:**
- Medicine Specialist
- Neurologist

---

### 164. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
Neuromedicine Specialist
```

**Subspecialties:**
- Medicine Specialist
- Neuromedicine Specialist

---

### 165. Diabetes Specialist

**Original Entry:**
```
Medicine Specialist
Neuromedicine Specialist
Diabetes Specialist
```

**Subspecialties:**
- Medicine Specialist
- Neuromedicine Specialist
- Diabetes Specialist

---

### 166. Gastroenterologist

**Original Entry:**
```
Medicine Specialist
Neuromedicine Specialist
Gastroenterologist
```

**Subspecialties:**
- Medicine Specialist
- Neuromedicine Specialist
- Gastroenterologist

---

### 167. Oncologist

**Original Entry:**
```
Medicine Specialist
Oncologist
```

**Subspecialties:**
- Medicine Specialist
- Oncologist

---

### 168. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
Pain Management Specialist
```

**Subspecialties:**
- Medicine Specialist
- Pain Management Specialist

---

### 169. Pediatric Nephrologist

**Original Entry:**
```
Medicine Specialist
Pediatric Nephrologist
```

**Subspecialties:**
- Medicine Specialist
- Pediatric Nephrologist

---

### 170. Pulmonologist

**Original Entry:**
```
Medicine Specialist
Pulmonologist
```

**Subspecialties:**
- Medicine Specialist
- Pulmonologist

---

### 171. Medicine Specialist

**Original Entry:**
```
Medicine Specialist
Respiratory Specialist
```

**Subspecialties:**
- Medicine Specialist
- Respiratory Specialist

---

### 172. Diabetes Specialist

**Original Entry:**
```
Medicine Specialist
Respiratory Specialist
Diabetes Specialist
```

**Subspecialties:**
- Medicine Specialist
- Respiratory Specialist
- Diabetes Specialist

---

### 173. Rheumatologist

**Original Entry:**
```
Medicine Specialist
Rheumatologist
```

**Subspecialties:**
- Medicine Specialist
- Rheumatologist

---

### 174. Rheumatologist

**Original Entry:**
```
Medicine Specialist
Urologist
Rheumatologist
```

**Subspecialties:**
- Medicine Specialist
- Urologist
- Rheumatologist

---

### 175. Neonatologist

**Original Entry:**
```
Neonatologist
```

**Type:** Single Specialty

---

### 176. Pediatric Surgeon

**Original Entry:**
```
Neonatologist
Pediatric Surgeon
```

**Subspecialties:**
- Neonatologist
- Pediatric Surgeon

---

### 177. Pediatrician

**Original Entry:**
```
Neonatologist
Pediatrician
```

**Subspecialties:**
- Neonatologist
- Pediatrician

---

### 178. Nephrologist

**Original Entry:**
```
Nephrologist
```

**Type:** Single Specialty

---

### 179. Diabetes Specialist

**Original Entry:**
```
Nephrologist
Diabetes Specialist
```

**Subspecialties:**
- Nephrologist
- Diabetes Specialist

---

### 180. Diabetologist

**Original Entry:**
```
Nephrologist
Diabetologist
```

**Subspecialties:**
- Nephrologist
- Diabetologist

---

### 181. Medicine Specialist

**Original Entry:**
```
Nephrologist
Medicine Specialist
```

**Subspecialties:**
- Nephrologist
- Medicine Specialist

---

### 182. Neuro Physician

**Original Entry:**
```
Neuro Physician
```

**Type:** Single Specialty

---

### 183. Neurologist

**Original Entry:**
```
Neurologist
```

**Type:** Single Specialty

---

### 184. Neurologist

**Original Entry:**
```
Neurologist
Anesthesiologist
```

**Subspecialties:**
- Neurologist
- Anesthesiologist

---

### 185. Internal Medicine Specialist

**Original Entry:**
```
Neurologist
Internal Medicine Specialist
```

**Subspecialties:**
- Neurologist
- Internal Medicine Specialist

---

### 186. Medicine Specialist

**Original Entry:**
```
Neurologist
Medicine Specialist
```

**Subspecialties:**
- Neurologist
- Medicine Specialist

---

### 187. Neurologist

**Original Entry:**
```
Neurologist
Neuromedicine Specialist
```

**Subspecialties:**
- Neurologist
- Neuromedicine Specialist

---

### 188. Neurosurgeon

**Original Entry:**
```
Neurologist
Neurosurgeon
```

**Subspecialties:**
- Neurologist
- Neurosurgeon

---

### 189. Pulmonologist

**Original Entry:**
```
Neurologist
Pulmonologist
```

**Subspecialties:**
- Neurologist
- Pulmonologist

---

### 190. Neuromedicine Specialist

**Original Entry:**
```
Neuromedicine Specialist
```

**Type:** Single Specialty

---

### 191. Medicine Specialist

**Original Entry:**
```
Neuromedicine Specialist
Medicine Specialist
```

**Subspecialties:**
- Neuromedicine Specialist
- Medicine Specialist

---

### 192. Neuromedicine Specialist

**Original Entry:**
```
Neuromedicine Specialist
Respiratory Specialist
```

**Subspecialties:**
- Neuromedicine Specialist
- Respiratory Specialist

---

### 193. Neurosurgeon

**Original Entry:**
```
Neurosurgeon
```

**Type:** Single Specialty

---

### 194. Pediatric Neurosurgeon

**Original Entry:**
```
Neurosurgeon
Pediatric Neurosurgeon
```

**Subspecialties:**
- Neurosurgeon
- Pediatric Neurosurgeon

---

### 195. Medicine Specialist

**Original Entry:**
```
Nucleologists
Medicine Specialist
```

**Subspecialties:**
- Nucleologists
- Medicine Specialist

---

### 196. Nutritionist

**Original Entry:**
```
Nutritionist
```

**Type:** Single Specialty

---

### 197. Gynecologists

**Original Entry:**
```
Obstetrician
Gynecologists
```

**Subspecialties:**
- Obstetrician
- Gynecologists

---

### 198. Oncologist

**Original Entry:**
```
Oncologist
```

**Type:** Single Specialty

---

### 199. General Surgeon

**Original Entry:**
```
Oncologist
General Surgeon
```

**Subspecialties:**
- Oncologist
- General Surgeon

---

### 200. Oncologist

**Original Entry:**
```
Oncologist
Radiologist
```

**Subspecialties:**
- Oncologist
- Radiologist

---

### 201. Oncologist

**Original Entry:**
```
Oncologist
Surgeon
```

**Subspecialties:**
- Oncologist
- Surgeon

---

### 202. Urologist

**Original Entry:**
```
Oncologist
Urologist
Laparoscopic Surgeon
```

**Subspecialties:**
- Oncologist
- Urologist
- Laparoscopic Surgeon

---

### 203. Ophthalmologist

**Original Entry:**
```
Ophthalmologist
```

**Type:** Single Specialty

---

### 204. Pediatrician

**Original Entry:**
```
Ophthalmologist
Pediatrician
```

**Subspecialties:**
- Ophthalmologist
- Pediatrician

---

### 205. Orthopedic Surgeon

**Original Entry:**
```
Orthopedic Surgeon
```

**Type:** Single Specialty

---

### 206. Orthopedic Surgeon

**Original Entry:**
```
Orthopedic Surgeon
Trauma Surgeon
Spine Surgeon
```

**Subspecialties:**
- Orthopedic Surgeon
- Trauma Surgeon
- Spine Surgeon

---

### 207. Orthopedist

**Original Entry:**
```
Orthopedist
```

**Type:** Single Specialty

---

### 208. Orthopedic Surgeon

**Original Entry:**
```
Orthopedist
Orthopedic Surgeon
```

**Subspecialties:**
- Orthopedist
- Orthopedic Surgeon

---

### 209. Orthopedist

**Original Entry:**
```
Orthopedist
Spine Surgeon
```

**Subspecialties:**
- Orthopedist
- Spine Surgeon

---

### 210. Orthopedist

**Original Entry:**
```
Orthopedist
Surgeon
```

**Subspecialties:**
- Orthopedist
- Surgeon

---

### 211. Otolaryngologists (ENT)

**Original Entry:**
```
Otolaryngologists (ENT)
```

**Type:** Single Specialty

---

### 212. Oncologist

**Original Entry:**
```
Otolaryngologists (ENT)
Oncologist
```

**Subspecialties:**
- Otolaryngologists (ENT)
- Oncologist

---

### 213. Otolaryngologists (ENT)

**Original Entry:**
```
Otolaryngologists (ENT)
Surgeon
```

**Subspecialties:**
- Otolaryngologists (ENT)
- Surgeon

---

### 214. Pain Management Specialist

**Original Entry:**
```
Pain Management Specialist
```

**Type:** Single Specialty

---

### 215. Pathologist

**Original Entry:**
```
Pathologist
```

**Type:** Single Specialty

---

### 216. Pediatric Cardiologist

**Original Entry:**
```
Pediatric Cardiologist
```

**Type:** Single Specialty

---

### 217. Pediatric Endocrinologist

**Original Entry:**
```
Pediatric Endocrinologist
Pediatrician
```

**Subspecialties:**
- Pediatric Endocrinologist
- Pediatrician

---

### 218. Pediatric Gastroenterologist

**Original Entry:**
```
Pediatric Gastroenterologist
```

**Type:** Single Specialty

---

### 219. Pediatric Hematologist

**Original Entry:**
```
Pediatric Hematologist
```

**Type:** Single Specialty

---

### 220. Oncologist

**Original Entry:**
```
Pediatric Hematologist
Oncologist
```

**Subspecialties:**
- Pediatric Hematologist
- Oncologist

---

### 221. Pediatric Hematologist & Oncologist

**Original Entry:**
```
Pediatric Hematologist & Oncologist
```

**Type:** Single Specialty

---

### 222. Pediatric Nephrologist

**Original Entry:**
```
Pediatric Nephrologist
```

**Type:** Single Specialty

---

### 223. Pediatric Neurologist

**Original Entry:**
```
Pediatric Neurologist
```

**Type:** Single Specialty

---

### 224. Pediatric Neurosurgeon

**Original Entry:**
```
Pediatric Neurosurgeon
```

**Type:** Single Specialty

---

### 225. Pediatric Pulmonologist

**Original Entry:**
```
Pediatric Pulmonologist
```

**Type:** Single Specialty

---

### 226. Pediatric Surgeon

**Original Entry:**
```
Pediatric Surgeon
```

**Type:** Single Specialty

---

### 227. Pediatric Surgeon

**Original Entry:**
```
Pediatric Surgeon
Orthopedist
```

**Subspecialties:**
- Pediatric Surgeon
- Orthopedist

---

### 228. Pediatrician

**Original Entry:**
```
Pediatrician
```

**Type:** Single Specialty

---

### 229. Hematologist

**Original Entry:**
```
Pediatrician
Hematologist
```

**Subspecialties:**
- Pediatrician
- Hematologist

---

### 230. Medicine Specialist

**Original Entry:**
```
Pediatrician
Medicine Specialist
```

**Subspecialties:**
- Pediatrician
- Medicine Specialist

---

### 231. Pediatrician

**Original Entry:**
```
Pediatrician
Neonatologist
```

**Subspecialties:**
- Pediatrician
- Neonatologist

---

### 232. Pediatrician

**Original Entry:**
```
Pediatrician
Nutritionist
```

**Subspecialties:**
- Pediatrician
- Nutritionist

---

### 233. Pediatrician

**Original Entry:**
```
Pediatrician
Ophthalmologist
```

**Subspecialties:**
- Pediatrician
- Ophthalmologist

---

### 234. Pediatrician

**Original Entry:**
```
Pediatrician
Orthopedist
```

**Subspecialties:**
- Pediatrician
- Orthopedist

---

### 235. Pediatric Cardiologist

**Original Entry:**
```
Pediatrician
Pediatric Cardiologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Cardiologist

---

### 236. Pediatric Gastroenterologist

**Original Entry:**
```
Pediatrician
Pediatric Gastroenterologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Gastroenterologist

---

### 237. Pediatric Hematologist

**Original Entry:**
```
Pediatrician
Pediatric Hematologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Hematologist

---

### 238. Pediatric Hematologist & Oncologist

**Original Entry:**
```
Pediatrician
Pediatric Hematologist & Oncologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Hematologist & Oncologist

---

### 239. Pediatric Nephrologist

**Original Entry:**
```
Pediatrician
Pediatric Nephrologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Nephrologist

---

### 240. Pediatric Neurologist

**Original Entry:**
```
Pediatrician
Pediatric Neurologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Neurologist

---

### 241. Pediatric Pulmonologist

**Original Entry:**
```
Pediatrician
Pediatric Pulmonologist
```

**Subspecialties:**
- Pediatrician
- Pediatric Pulmonologist

---

### 242. Pediatrician

**Original Entry:**
```
Pediatrician
Pediatrician & Neonatologist
```

**Subspecialties:**
- Pediatrician
- Pediatrician & Neonatologist

---

### 243. Pediatrician

**Original Entry:**
```
Pediatrician
Psychiatrist
```

**Subspecialties:**
- Pediatrician
- Psychiatrist

---

### 244. Pulmonologist

**Original Entry:**
```
Pediatrician
Pulmonologist
```

**Subspecialties:**
- Pediatrician
- Pulmonologist

---

### 245. Pediatrician & Neonatologist

**Original Entry:**
```
Pediatrician & Neonatologist
```

**Type:** Single Specialty

---

### 246. Pediatrician & Neonatologist

**Original Entry:**
```
Pediatrician & Neonatologist
Nutritionist
```

**Subspecialties:**
- Pediatrician & Neonatologist
- Nutritionist

---

### 247. Physical Medicine

**Original Entry:**
```
Physical Medicine
```

**Type:** Single Specialty

---

### 248. Physical Medicine

**Original Entry:**
```
Physical Medicine
Pain Management Specialist
```

**Subspecialties:**
- Physical Medicine
- Pain Management Specialist

---

### 249. Physical Medicine

**Original Entry:**
```
Physical Medicine
Rehabilitation Specialist
```

**Subspecialties:**
- Physical Medicine
- Rehabilitation Specialist

---

### 250. Rheumatologist

**Original Entry:**
```
Physical Medicine
Rheumatologist
```

**Subspecialties:**
- Physical Medicine
- Rheumatologist

---

### 251. Physiotherapist

**Original Entry:**
```
Physiotherapist
```

**Type:** Single Specialty

---

### 252. Physiotherapist

**Original Entry:**
```
Physiotherapist
Rehabilitation Specialist
```

**Subspecialties:**
- Physiotherapist
- Rehabilitation Specialist

---

### 253. Plastic Surgeon

**Original Entry:**
```
Plastic Surgeon
```

**Type:** Single Specialty

---

### 254. Psychiatrist

**Original Entry:**
```
Psychiatrist
```

**Type:** Single Specialty

---

### 255. Psychologist

**Original Entry:**
```
Psychologist
```

**Type:** Single Specialty

---

### 256. Pulmonary Medicine Specialist

**Original Entry:**
```
Pulmonary Medicine Specialist
```

**Type:** Single Specialty

---

### 257. Pulmonologist

**Original Entry:**
```
Pulmonologist
```

**Type:** Single Specialty

---

### 258. Medicine Specialist

**Original Entry:**
```
Pulmonologist
Medicine Specialist
```

**Subspecialties:**
- Pulmonologist
- Medicine Specialist

---

### 259. Pulmonologist

**Original Entry:**
```
Pulmonologist
Respiratory Specialist
```

**Subspecialties:**
- Pulmonologist
- Respiratory Specialist

---

### 260. Radiologist

**Original Entry:**
```
Radiologist
```

**Type:** Single Specialty

---

### 261. Oncologist

**Original Entry:**
```
Radiologist
Oncologist
```

**Subspecialties:**
- Radiologist
- Oncologist

---

### 262. Rehabilitation Specialist

**Original Entry:**
```
Rehabilitation Specialist
```

**Type:** Single Specialty

---

### 263. Respiratory Specialist

**Original Entry:**
```
Respiratory Specialist
```

**Type:** Single Specialty

---

### 264. Respiratory Specialist

**Original Entry:**
```
Respiratory Specialist
Chest Specialist
```

**Subspecialties:**
- Respiratory Specialist
- Chest Specialist

---

### 265. Dermatologist

**Original Entry:**
```
Respiratory Specialist
Dermatologist
```

**Subspecialties:**
- Respiratory Specialist
- Dermatologist

---

### 266. Respiratory Specialist

**Original Entry:**
```
Respiratory Specialist
Internal Medicine
```

**Subspecialties:**
- Respiratory Specialist
- Internal Medicine

---

### 267. Internal Medicine Specialist

**Original Entry:**
```
Respiratory Specialist
Internal Medicine Specialist
```

**Subspecialties:**
- Respiratory Specialist
- Internal Medicine Specialist

---

### 268. Medicine Specialist

**Original Entry:**
```
Respiratory Specialist
Medicine Specialist
```

**Subspecialties:**
- Respiratory Specialist
- Medicine Specialist

---

### 269. Rheumatologist

**Original Entry:**
```
Rheumatologist
```

**Type:** Single Specialty

---

### 270. Medicine Specialist

**Original Entry:**
```
Rheumatologist
Medicine Specialist
```

**Subspecialties:**
- Rheumatologist
- Medicine Specialist

---

### 271. Sonologist

**Original Entry:**
```
Sonologist
```

**Type:** Single Specialty

---

### 272. Surgeon

**Original Entry:**
```
Surgeon
```

**Type:** Single Specialty

---

### 273. Oncologist

**Original Entry:**
```
Surgeon
Colorectal Surgeon
General Surgeon
Oncologist
Laparoscopic Surgeon
```

**Subspecialties:**
- Surgeon
- Colorectal Surgeon
- General Surgeon
- Oncologist
- Laparoscopic Surgeon

---

### 274. Colorectal & Laparoscopic Surgeon

**Original Entry:**
```
Surgeon
Hepatobiliary Surgeon
Colorectal & Laparoscopic Surgeon
```

**Subspecialties:**
- Surgeon
- Hepatobiliary Surgeon
- Colorectal & Laparoscopic Surgeon

---

### 275. Laparoscopic Surgeon

**Original Entry:**
```
Surgeon
Laparoscopic Surgeon
```

**Subspecialties:**
- Surgeon
- Laparoscopic Surgeon

---

### 276. Urologist

**Original Entry:**
```
Surgeon
Urologist
```

**Subspecialties:**
- Surgeon
- Urologist

---

### 277. Thoracic Surgeon

**Original Entry:**
```
Thoracic Surgeon
```

**Type:** Single Specialty

---

### 278. Cardiac Surgeon

**Original Entry:**
```
Thoracic Surgeon
Cardiac Surgeon
Vascular Surgeon
```

**Subspecialties:**
- Thoracic Surgeon
- Cardiac Surgeon
- Vascular Surgeon

---

### 279. Cardiothoracic Surgeon

**Original Entry:**
```
Thoracic Surgeon
Cardiothoracic Surgeon
```

**Subspecialties:**
- Thoracic Surgeon
- Cardiothoracic Surgeon

---

### 280. Transfusion Medicine Specialist

**Original Entry:**
```
Transfusion Medicine Specialist
```

**Type:** Single Specialty

---

### 281. Trauma Surgeon

**Original Entry:**
```
Trauma Surgeon
Orthopedist
```

**Subspecialties:**
- Trauma Surgeon
- Orthopedist

---

### 282. Urologist

**Original Entry:**
```
Urologist
```

**Type:** Single Specialty

---

### 283. General Surgeon

**Original Entry:**
```
Urologist
General Surgeon
```

**Subspecialties:**
- Urologist
- General Surgeon

---

### 284. Laparoscopic Surgeon

**Original Entry:**
```
Urologist
Laparoscopic Surgeon
```

**Subspecialties:**
- Urologist
- Laparoscopic Surgeon

---

### 285. Urologist

**Original Entry:**
```
Urologist
Surgeon
```

**Subspecialties:**
- Urologist
- Surgeon

---

### 286. Vascular Surgeon

**Original Entry:**
```
Vascular Surgeon
```

**Type:** Single Specialty

---

### 287. General Surgeon

**Original Entry:**
```
Vascular Surgeon
General Surgeon
```

**Subspecialties:**
- Vascular Surgeon
- General Surgeon

---

### 288. Cardiac Surgeon

**Original Entry:**
```
Vascular Surgeon
Thoracic Surgeon
Cardiac Surgeon
```

**Subspecialties:**
- Vascular Surgeon
- Thoracic Surgeon
- Cardiac Surgeon

---


## Common Normalization Patterns

### 1. Heart Specialists
- "Heart Specialist" → **Cardiologist**
- "Cardiac Surgeon" → **Cardiac Surgeon**
- "Cardiothoracic Surgeon" → **Cardiothoracic Surgeon**
- "Interventional Cardiologist" → **Interventional Cardiologist**

### 2. Diabetes Care
- "Diabetes Specialist" → **Diabetes Specialist**
- "Diabetologist" → **Diabetologist**
- (These terms are often used interchangeably)

### 3. Digestive System
- "Gastroenterologist" → **Gastroenterologist**
- "Hepatologist" → **Hepatologist** (Liver specialist)
- "Colorectal Surgeon" → **Colorectal Surgeon**

### 4. Children's Health
- "Pediatrician" → **Pediatrician**
- "Neonatologist" → **Neonatologist** (Newborn specialist)
- "Pediatric [Subspecialty]" → **Pediatric [Subspecialty]**

### 5. Surgery Specialties
- "General Surgeon" → **General Surgeon**
- "Laparoscopic Surgeon" → **Laparoscopic Surgeon** (Minimally invasive)
- "Plastic Surgeon" → **Plastic Surgeon**
- "Orthopedic Surgeon" / "Orthopedist" → **Orthopedic Surgeon**

### 6. Women's Health
- "Gynecologist & Obstetrician" → **Gynecologist & Obstetrician**
- "Infertility Specialist" → **Infertility Specialist**

### 7. Brain & Nervous System
- "Neurologist" → **Neurologist**
- "Neurosurgeon" → **Neurosurgeon**
- "Neuromedicine Specialist" → **Neuromedicine Specialist**

### 8. Lungs & Breathing
- "Pulmonologist" → **Pulmonologist**
- "Respiratory Specialist" → **Respiratory Specialist**
- "Chest Specialist" → **Chest Specialist**

### 9. Skin Conditions
- "Dermatologist" → **Dermatologist**
- "Venereologist" → **Venereologist** (Sexually transmitted diseases)
- "Laser Dermatosurgeon" → **Laser Dermatosurgeon**

### 10. Multi-Specialty Doctors
For doctors with multiple specialties, the primary specialty is selected based on:
1. Most specialized/specific qualification
2. Medical hierarchy (surgical > medical > general)
3. First listed specialty if equal priority

---

## Notes

- **Carriage Returns (\r\n)**: Many entries in the original data contained line breaks separating multiple specialties
- **Combined Specialties**: Doctors practicing in multiple fields are listed with all their specialties
- **Normalization Priority**: When multiple specialties exist, the most specific or primary specialty is chosen as the normalized form
- **Case Sensitivity**: All specialty names maintain their original capitalization

---

*Generated from doctors_combined_data.csv*  
*Total Records: 6,520 doctors*  
*Distinct Specialties: 288*
