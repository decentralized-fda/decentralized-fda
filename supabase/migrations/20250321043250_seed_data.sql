-- =============================================
-- SEED DATA - Initial Data Population
-- =============================================

-- Core Schema - User Groups
INSERT INTO core.user_groups (name, description) VALUES
('administrators', 'System administrators with full access'),
('staff', 'Staff members with elevated privileges'),
('researchers', 'Research team members'),
('providers', 'Healthcare providers'),
('patients', 'Regular patients/users');

-- Core Schema - User Permissions
INSERT INTO core.user_permissions (permission, description) VALUES
('manage_users', 'Can manage user accounts'),
('view_users', 'Can view user profiles'),
('manage_trials', 'Can manage clinical trials'),
('view_trials', 'Can view clinical trial data'),
('manage_medical', 'Can manage medical records'),
('view_medical', 'Can view medical records'),
('manage_commerce', 'Can manage e-commerce operations'),
('view_commerce', 'Can view e-commerce data'),
('manage_scheduling', 'Can manage scheduling'),
('view_scheduling', 'Can view schedules'),
('manage_logistics', 'Can manage logistics'),
('view_logistics', 'Can view logistics data'),
('manage_finances', 'Can manage financial operations'),
('view_finances', 'Can view financial data'),
('manage_oauth2', 'Can manage OAuth2 applications'),
('view_oauth2', 'Can view OAuth2 data');

-- Medical Reference Schema - Variable Categories
INSERT INTO medical_ref.variable_categories (name, description, display_name) VALUES
('vital_signs', 'Basic health measurements', 'Vital Signs'),
('lab_results', 'Laboratory test results', 'Lab Results'),
('medications', 'Medication tracking', 'Medications'),
('symptoms', 'Symptom tracking', 'Symptoms'),
('conditions', 'Medical conditions', 'Conditions'),
('lifestyle', 'Lifestyle factors', 'Lifestyle'),
('nutrition', 'Nutrition tracking', 'Nutrition'),
('physical_activity', 'Physical activity tracking', 'Physical Activity');

-- Medical Reference Schema - Units of Measurement
INSERT INTO medical_ref.units_of_measurement (name, symbol, description, category) VALUES
('milligrams', 'mg', 'Weight in milligrams', 'weight'),
('grams', 'g', 'Weight in grams', 'weight'),
('kilograms', 'kg', 'Weight in kilograms', 'weight'),
('milliliters', 'ml', 'Volume in milliliters', 'volume'),
('liters', 'l', 'Volume in liters', 'volume'),
('celsius', '°C', 'Temperature in Celsius', 'temperature'),
('fahrenheit', '°F', 'Temperature in Fahrenheit', 'temperature'),
('beats_per_minute', 'bpm', 'Heart rate', 'rate'),
('millimeters_mercury', 'mmHg', 'Blood pressure', 'pressure'),
('steps', 'steps', 'Number of steps', 'count'),
('hours', 'hrs', 'Duration in hours', 'time'),
('minutes', 'min', 'Duration in minutes', 'time'),
('seconds', 'sec', 'Duration in seconds', 'time');

-- Medical Reference Schema - Common Lab Tests
INSERT INTO medical_ref.lab_tests (name, description, category, unit_id) VALUES
('blood_glucose', 'Blood glucose level', 'blood', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mg')),
('hemoglobin_a1c', 'Hemoglobin A1C percentage', 'blood', NULL),
('total_cholesterol', 'Total cholesterol level', 'blood', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mg')),
('hdl_cholesterol', 'HDL cholesterol level', 'blood', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mg')),
('ldl_cholesterol', 'LDL cholesterol level', 'blood', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mg')),
('triglycerides', 'Triglycerides level', 'blood', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mg')),
('blood_pressure_systolic', 'Systolic blood pressure', 'vital', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mmHg')),
('blood_pressure_diastolic', 'Diastolic blood pressure', 'vital', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'mmHg')),
('heart_rate', 'Heart rate', 'vital', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = 'bpm')),
('body_temperature', 'Body temperature', 'vital', (SELECT id FROM medical_ref.units_of_measurement WHERE symbol = '°C'));

-- Commerce Schema - Service Types
INSERT INTO scheduling.service_types (name, description, duration_minutes, is_active) VALUES
('initial_consultation', 'Initial medical consultation', 60, true),
('follow_up', 'Follow-up appointment', 30, true),
('lab_review', 'Laboratory results review', 30, true),
('treatment_session', 'Treatment session', 45, true),
('emergency_consultation', 'Emergency consultation', 60, true);

-- Logistics Schema - Shipping Methods
INSERT INTO logistics.shipping_methods (name, description, estimated_days_min, estimated_days_max, is_active) VALUES
('standard', 'Standard shipping (5-7 business days)', 5, 7, true),
('express', 'Express shipping (2-3 business days)', 2, 3, true),
('overnight', 'Overnight shipping (next business day)', 1, 1, true),
('international', 'International shipping (7-14 business days)', 7, 14, true);

-- Create default shipping rates
INSERT INTO logistics.shipping_rates (shipping_method_id, zone, base_rate, rate_per_kg) VALUES
((SELECT id FROM logistics.shipping_methods WHERE name = 'standard'), 'domestic', 5.99, 0.50),
((SELECT id FROM logistics.shipping_methods WHERE name = 'express'), 'domestic', 12.99, 1.00),
((SELECT id FROM logistics.shipping_methods WHERE name = 'overnight'), 'domestic', 24.99, 2.00),
((SELECT id FROM logistics.shipping_methods WHERE name = 'international'), 'international', 19.99, 3.00); 