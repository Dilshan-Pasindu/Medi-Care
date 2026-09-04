-- MediCare Seed Data
-- Run this AFTER migration.sql in Supabase SQL Editor

-- ============================================
-- SPECIALISTS
-- ============================================
INSERT INTO specialists (id, name, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'General Physician', 'Treats common illnesses and general health conditions'),
  ('a1000000-0000-0000-0000-000000000002', 'Cardiologist', 'Specializes in heart and cardiovascular conditions'),
  ('a1000000-0000-0000-0000-000000000003', 'Dermatologist', 'Specializes in skin, hair, and nail conditions'),
  ('a1000000-0000-0000-0000-000000000004', 'Pediatrician', 'Specializes in medical care for infants, children, and adolescents'),
  ('a1000000-0000-0000-0000-000000000005', 'ENT Specialist', 'Specializes in ear, nose, and throat conditions'),
  ('a1000000-0000-0000-0000-000000000006', 'Neurologist', 'Specializes in disorders of the nervous system'),
  ('a1000000-0000-0000-0000-000000000007', 'Orthopedic Specialist', 'Specializes in musculoskeletal system conditions');

-- ============================================
-- SYMPTOMS
-- ============================================
INSERT INTO symptoms (id, name) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Fever'),
  ('b1000000-0000-0000-0000-000000000002', 'Cough'),
  ('b1000000-0000-0000-0000-000000000003', 'Headache'),
  ('b1000000-0000-0000-0000-000000000004', 'Skin Rash'),
  ('b1000000-0000-0000-0000-000000000005', 'Joint Pain'),
  ('b1000000-0000-0000-0000-000000000006', 'Ear Pain'),
  ('b1000000-0000-0000-0000-000000000007', 'Sore Throat'),
  ('b1000000-0000-0000-0000-000000000008', 'Stomach Pain'),
  ('b1000000-0000-0000-0000-000000000009', 'Chest Pain'),
  ('b1000000-0000-0000-0000-000000000010', 'Dizziness'),
  ('b1000000-0000-0000-0000-000000000011', 'Back Pain'),
  ('b1000000-0000-0000-0000-000000000012', 'Shortness of Breath');

-- ============================================
-- SYMPTOM-SPECIALIST MAPPINGS (weights for scoring)
-- ============================================
INSERT INTO symptom_specialists (symptom_id, specialist_id, weight) VALUES
  -- Fever mappings
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 5), -- General Physician
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 3), -- Pediatrician
  -- Cough mappings
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 4), -- General Physician
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 3), -- ENT
  -- Headache mappings
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 3), -- General Physician
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 5), -- Neurologist
  -- Skin Rash mappings
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 5), -- Dermatologist
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 2), -- General Physician
  -- Joint Pain mappings
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000007', 5), -- Orthopedic
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 2), -- General Physician
  -- Ear Pain mappings
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 5), -- ENT
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 2), -- General Physician
  -- Sore Throat mappings
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000005', 4), -- ENT
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 3), -- General Physician
  -- Stomach Pain mappings
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 4), -- General Physician
  -- Chest Pain mappings
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002', 5), -- Cardiologist
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 2), -- General Physician
  -- Dizziness mappings
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000006', 4), -- Neurologist
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 3), -- General Physician
  -- Back Pain mappings
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000007', 5), -- Orthopedic
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001', 2), -- General Physician
  -- Shortness of Breath mappings
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 5), -- Cardiologist
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001', 3); -- General Physician

-- ============================================
-- USERS (password is 'password123' hashed with bcrypt)
-- ============================================
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Kasun Perera', 'kasun@medicare.com', '$2a$10$CKwkWNPLjAJQzE0FI73JS.ZdrZ3JOq0OSEjlOlYoypvN6m78AVFeC', 'PATIENT'),
  ('c1000000-0000-0000-0000-000000000002', 'Dr. Nimal Silva', 'nimal@medicare.com', '$2a$10$CKwkWNPLjAJQzE0FI73JS.ZdrZ3JOq0OSEjlOlYoypvN6m78AVFeC', 'DOCTOR'),
  ('c1000000-0000-0000-0000-000000000003', 'Amal Fernando', 'amal@medicare.com', '$2a$10$CKwkWNPLjAJQzE0FI73JS.ZdrZ3JOq0OSEjlOlYoypvN6m78AVFeC', 'PHARMACIST'),
  ('c1000000-0000-0000-0000-000000000004', 'Dr. Saman Kumara', 'saman@medicare.com', '$2a$10$CKwkWNPLjAJQzE0FI73JS.ZdrZ3JOq0OSEjlOlYoypvN6m78AVFeC', 'DOCTOR'),
  ('c1000000-0000-0000-0000-000000000005', 'Nimali Jayasinghe', 'nimali@medicare.com', '$2a$10$CKwkWNPLjAJQzE0FI73JS.ZdrZ3JOq0OSEjlOlYoypvN6m78AVFeC', 'PATIENT');

-- ============================================
-- PATIENTS
-- ============================================
INSERT INTO patients (id, user_id, phone, date_of_birth) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '0771234567', '1995-03-15'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', '0779876543', '1988-07-22');

-- ============================================
-- DOCTORS
-- ============================================
INSERT INTO doctors (id, user_id, specialist_id) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'), -- Dr. Nimal - General Physician
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'); -- Dr. Saman - Cardiologist

-- ============================================
-- MEDICINES
-- ============================================
INSERT INTO medicines (id, name, category, price, stock_quantity, minimum_stock, expiry_date) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Paracetamol 500mg', 'Analgesic', 5.00, 245, 20, '2027-12-31'),
  ('f1000000-0000-0000-0000-000000000002', 'Cetirizine 10mg', 'Antihistamine', 8.00, 83, 15, '2027-06-30'),
  ('f1000000-0000-0000-0000-000000000003', 'Amoxicillin 500mg', 'Antibiotic', 12.00, 120, 25, '2027-09-30'),
  ('f1000000-0000-0000-0000-000000000004', 'Ibuprofen 400mg', 'Anti-inflammatory', 6.00, 180, 20, '2027-11-30'),
  ('f1000000-0000-0000-0000-000000000005', 'Omeprazole 20mg', 'Antacid', 10.00, 95, 15, '2027-08-31'),
  ('f1000000-0000-0000-0000-000000000006', 'Metformin 500mg', 'Antidiabetic', 4.00, 200, 30, '2028-03-31'),
  ('f1000000-0000-0000-0000-000000000007', 'Losartan 50mg', 'Antihypertensive', 15.00, 8, 10, '2027-10-31'),
  ('f1000000-0000-0000-0000-000000000008', 'Salbutamol Inhaler', 'Bronchodilator', 350.00, 25, 5, '2027-07-31'),
  ('f1000000-0000-0000-0000-000000000009', 'Diclofenac Gel 30g', 'Topical Anti-inflammatory', 45.00, 0, 10, '2027-05-31'),
  ('f1000000-0000-0000-0000-000000000010', 'Vitamin C 500mg', 'Supplement', 3.00, 300, 20, '2028-01-31');

-- ============================================
-- SAMPLE APPOINTMENTS
-- ============================================
INSERT INTO appointments (id, patient_id, doctor_id, date, time, status, symptoms) VALUES
  ('11000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', CURRENT_DATE, '10:00', 'BOOKED', ARRAY['Fever', 'Cough', 'Headache']),
  ('11000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', CURRENT_DATE, '11:00', 'BOOKED', ARRAY['Headache', 'Dizziness']);
