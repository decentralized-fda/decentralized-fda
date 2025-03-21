-- =============================================
-- INDEXES - Performance Optimization
-- =============================================

-- Core Schema Indexes
CREATE INDEX idx_profiles_email ON core.profiles(email);
CREATE INDEX idx_profiles_username ON core.profiles(username);
CREATE INDEX idx_addresses_user_id ON core.addresses(user_id);
CREATE INDEX idx_user_permissions_user_id ON core.user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON core.user_permissions(permission);
CREATE INDEX idx_user_groups_name ON core.user_groups(name);
CREATE INDEX idx_user_group_members_group_id ON core.user_group_members(group_id);
CREATE INDEX idx_user_group_members_user_id ON core.user_group_members(user_id);
CREATE INDEX idx_user_consents_user_id ON core.user_consents(user_id);
CREATE INDEX idx_data_sharing_agreements_user_id ON core.data_sharing_agreements(user_id);
CREATE INDEX idx_user_data_exports_user_id ON core.user_data_exports(user_id);
CREATE INDEX idx_notifications_user_id ON core.notifications(user_id);
CREATE INDEX idx_notifications_status ON core.notifications(status);
CREATE INDEX idx_tags_name ON core.tags(name);
CREATE INDEX idx_tagged_items_tag_id ON core.tagged_items(tag_id);
CREATE INDEX idx_tagged_items_item_type_item_id ON core.tagged_items(item_type, item_id);
CREATE INDEX idx_audit_trail_table_name ON core.audit_trail(table_name);
CREATE INDEX idx_audit_trail_record_id ON core.audit_trail(record_id);
CREATE INDEX idx_audit_trail_user_id ON core.audit_trail(user_id);
CREATE INDEX idx_integration_providers_name ON core.integration_providers(name);
CREATE INDEX idx_integration_connections_user_id ON core.integration_connections(user_id);
CREATE INDEX idx_integration_sync_logs_connection_id ON core.integration_sync_logs(connection_id);

-- Medical Reference Schema Indexes
CREATE INDEX idx_variable_categories_name ON medical_ref.variable_categories(name);
CREATE INDEX idx_global_variables_name ON medical_ref.global_variables(name);
CREATE INDEX idx_global_variables_category_id ON medical_ref.global_variables(category_id);
CREATE INDEX idx_variable_ingredients_variable_id ON medical_ref.variable_ingredients(variable_id);
CREATE INDEX idx_variable_relationships_from_variable_id ON medical_ref.variable_relationships(from_variable_id);
CREATE INDEX idx_variable_relationships_to_variable_id ON medical_ref.variable_relationships(to_variable_id);
CREATE INDEX idx_variable_synonyms_variable_id ON medical_ref.variable_synonyms(variable_id);
CREATE INDEX idx_variable_synonyms_name ON medical_ref.variable_synonyms(name);
CREATE INDEX idx_units_of_measurement_name ON medical_ref.units_of_measurement(name);
CREATE INDEX idx_data_quality_rules_variable_id ON medical_ref.data_quality_rules(variable_id);
CREATE INDEX idx_lab_tests_name ON medical_ref.lab_tests(name);

-- Medical Schema Indexes
CREATE INDEX idx_user_variables_user_id ON medical.user_variables(user_id);
CREATE INDEX idx_user_variables_variable_id ON medical.user_variables(variable_id);
CREATE INDEX idx_variable_measurements_user_id ON medical.variable_measurements(user_id);
CREATE INDEX idx_variable_measurements_variable_id ON medical.variable_measurements(variable_id);
CREATE INDEX idx_variable_measurements_timestamp ON medical.variable_measurements(timestamp);
CREATE INDEX idx_variable_ratings_user_id ON medical.variable_ratings(user_id);
CREATE INDEX idx_variable_ratings_variable_id ON medical.variable_ratings(variable_id);
CREATE INDEX idx_conditions_user_id ON medical.conditions(user_id);
CREATE INDEX idx_medications_user_id ON medical.medications(user_id);
CREATE INDEX idx_lab_results_user_id ON medical.lab_results(user_id);
CREATE INDEX idx_lab_results_test_id ON medical.lab_results(test_id);
CREATE INDEX idx_documents_user_id ON medical.documents(user_id);

-- Trials Schema Indexes
CREATE INDEX idx_protocols_title ON trials.protocols(title);
CREATE INDEX idx_protocols_status ON trials.protocols(status);
CREATE INDEX idx_arms_protocol_id ON trials.arms(protocol_id);
CREATE INDEX idx_interventions_protocol_id ON trials.interventions(protocol_id);
CREATE INDEX idx_outcomes_protocol_id ON trials.outcomes(protocol_id);
CREATE INDEX idx_participants_protocol_id ON trials.participants(protocol_id);
CREATE INDEX idx_participants_user_id ON trials.participants(user_id);
CREATE INDEX idx_data_points_participant_id ON trials.data_points(participant_id);
CREATE INDEX idx_data_points_outcome_id ON trials.data_points(outcome_id);
CREATE INDEX idx_adverse_events_participant_id ON trials.adverse_events(participant_id);
CREATE INDEX idx_documents_protocol_id ON trials.documents(protocol_id);

-- Commerce Schema Indexes
CREATE INDEX idx_products_name ON commerce.products(name);
CREATE INDEX idx_products_status ON commerce.products(status);
CREATE INDEX idx_product_images_product_id ON commerce.product_images(product_id);
CREATE INDEX idx_cart_items_user_id ON commerce.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON commerce.cart_items(product_id);
CREATE INDEX idx_orders_user_id ON commerce.orders(user_id);
CREATE INDEX idx_orders_status ON commerce.orders(status);
CREATE INDEX idx_order_items_order_id ON commerce.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON commerce.order_items(product_id);
CREATE INDEX idx_discounts_code ON commerce.discounts(code);
CREATE INDEX idx_product_reviews_product_id ON commerce.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON commerce.product_reviews(user_id);
CREATE INDEX idx_wishlists_user_id ON commerce.wishlists(user_id);
CREATE INDEX idx_wishlist_items_wishlist_id ON commerce.wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON commerce.wishlist_items(product_id);

-- Scheduling Schema Indexes
CREATE INDEX idx_service_types_name ON scheduling.service_types(name);
CREATE INDEX idx_service_providers_user_id ON scheduling.service_providers(user_id);
CREATE INDEX idx_provider_services_provider_id ON scheduling.provider_services(provider_id);
CREATE INDEX idx_provider_services_service_type_id ON scheduling.provider_services(service_type_id);
CREATE INDEX idx_provider_schedules_provider_id ON scheduling.provider_schedules(provider_id);
CREATE INDEX idx_schedule_exceptions_provider_id ON scheduling.schedule_exceptions(provider_id);
CREATE INDEX idx_appointments_provider_id ON scheduling.appointments(provider_id);
CREATE INDEX idx_appointments_user_id ON scheduling.appointments(user_id);
CREATE INDEX idx_appointments_service_id ON scheduling.appointments(service_id);
CREATE INDEX idx_appointments_status ON scheduling.appointments(status);
CREATE INDEX idx_appointment_reminders_appointment_id ON scheduling.appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_feedback_appointment_id ON scheduling.appointment_feedback(appointment_id);

-- Logistics Schema Indexes
CREATE INDEX idx_warehouses_name ON logistics.warehouses(name);
CREATE INDEX idx_inventory_warehouse_id ON logistics.inventory(warehouse_id);
CREATE INDEX idx_inventory_product_id ON logistics.inventory(product_id);
CREATE INDEX idx_inventory_transactions_warehouse_id ON logistics.inventory_transactions(warehouse_id);
CREATE INDEX idx_inventory_transactions_product_id ON logistics.inventory_transactions(product_id);
CREATE INDEX idx_shipping_methods_name ON logistics.shipping_methods(name);
CREATE INDEX idx_shipping_rates_shipping_method_id ON logistics.shipping_rates(shipping_method_id);
CREATE INDEX idx_shipments_order_id ON logistics.shipments(order_id);
CREATE INDEX idx_shipments_status ON logistics.shipments(status);
CREATE INDEX idx_shipment_items_shipment_id ON logistics.shipment_items(shipment_id);
CREATE INDEX idx_returns_order_id ON logistics.returns(order_id);
CREATE INDEX idx_returns_status ON logistics.returns(status);
CREATE INDEX idx_return_items_return_id ON logistics.return_items(return_id);

-- Finance Schema Indexes
CREATE INDEX idx_payment_methods_user_id ON finance.payment_methods(user_id);
CREATE INDEX idx_transactions_user_id ON finance.transactions(user_id);
CREATE INDEX idx_transactions_status ON finance.transactions(status);
CREATE INDEX idx_invoices_user_id ON finance.invoices(user_id);
CREATE INDEX idx_invoices_status ON finance.invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON finance.invoice_items(invoice_id);
CREATE INDEX idx_subscriptions_user_id ON finance.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON finance.subscriptions(status);
CREATE INDEX idx_subscription_items_subscription_id ON finance.subscription_items(subscription_id);
CREATE INDEX idx_credits_user_id ON finance.credits(user_id);
CREATE INDEX idx_credits_status ON finance.credits(status);
CREATE INDEX idx_credit_transactions_credit_id ON finance.credit_transactions(credit_id);

-- OAuth2 Schema Indexes
CREATE INDEX idx_oauth2_clients_client_id ON oauth2.clients(client_id);
CREATE INDEX idx_oauth2_clients_owner_id ON oauth2.clients(owner_id);
CREATE INDEX idx_oauth2_access_tokens_token ON oauth2.access_tokens(token);
CREATE INDEX idx_oauth2_access_tokens_client_id ON oauth2.access_tokens(client_id);
CREATE INDEX idx_oauth2_access_tokens_user_id ON oauth2.access_tokens(user_id);
CREATE INDEX idx_oauth2_refresh_tokens_token ON oauth2.refresh_tokens(token);
CREATE INDEX idx_oauth2_refresh_tokens_access_token_id ON oauth2.refresh_tokens(access_token_id);
CREATE INDEX idx_oauth2_authorization_codes_code ON oauth2.authorization_codes(code);
CREATE INDEX idx_oauth2_authorization_codes_client_id ON oauth2.authorization_codes(client_id);
CREATE INDEX idx_oauth2_authorization_codes_user_id ON oauth2.authorization_codes(user_id);
CREATE INDEX idx_oauth2_user_consents_client_id ON oauth2.user_consents(client_id);
CREATE INDEX idx_oauth2_user_consents_user_id ON oauth2.user_consents(user_id); 