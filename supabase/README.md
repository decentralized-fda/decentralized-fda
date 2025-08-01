# Decentralized FDA Database Structure

A decentralized platform for clinical trials, real-world evidence, and treatment effectiveness rankings.

## Database Schema Organization

The database is organized into logical schemas, each handling specific aspects of the decentralized FDA platform. Migrations are grouped by functionality in numbered folders.

### Migration Structure

```
├── cohort/
    │   ├── adverse_events.sql
    │   │   ├── Tables:
    │   │   └── cohort.adverse_events
    │   ├── interventions.sql
    │   │   ├── Tables:
    │   │   └── cohort.interventions
    │   ├── outcomes.sql
    │   │   ├── Tables:
    │   │   └── cohort.outcomes
    │   ├── protocols.sql
    │   │   ├── Tables:
    │   │   └── cohort.protocols
    │   ├── trial_arms.sql
    │   │   ├── Tables:
    │   │   └── cohort.trial_arms
    │   ├── trial_documents.sql
    │   │   ├── Tables:
    │   │   └── cohort.trial_documents
    │   ├── trial_measurements.sql
    │   │   ├── Tables:
    │   │   └── cohort.trial_measurements
    │   ├── trial_phases.sql
    │   │   ├── Tables:
    │   │   └── cohort.trial_phases
    │   ├── trials_participants.sql
    │   │   ├── Tables:
    │   │   └── cohort.trials_participants
    │   └── trials.sql
    │       ├── Tables:
    │       └── cohort.trials
    ├── commerce/
    │   ├── cart_items.sql
    │   │   ├── Tables:
    │   │   └── commerce.cart_items
    │   ├── commerce_schema.sql
    │   ├── discounts.sql
    │   │   ├── Tables:
    │   │   └── commerce.discounts
    │   ├── order_items.sql
    │   │   ├── Tables:
    │   │   └── commerce.order_items
    │   ├── orders.sql
    │   │   ├── Tables:
    │   │   └── commerce.orders
    │   ├── product_images.sql
    │   │   ├── Tables:
    │   │   └── commerce.product_images
    │   ├── product_reviews.sql
    │   │   ├── Tables:
    │   │   └── commerce.product_reviews
    │   ├── products.sql
    │   │   ├── Tables:
    │   │   └── commerce.products
    │   ├── wishlist_items.sql
    │   │   ├── Tables:
    │   │   └── commerce.wishlist_items
    │   └── wishlists.sql
    │       ├── Tables:
    │       └── commerce.wishlists
    ├── core/
    │   ├── access_control.sql
    │   │   ├── Tables:
    │   │   ├── core.user_group_members
    │   │   ├── core.user_groups
    │   │   └── core.user_permissions
    │   ├── audit.sql
    │   │   ├── Tables:
    │   │   ├── core.audit_settings
    │   │   ├── core.audit_trail
    │   │   ├── core.integration_connections
    │   │   ├── core.integration_providers
    │   │   └── core.integration_sync_logs
    │   ├── consents.sql
    │   │   ├── Tables:
    │   │   ├── core.data_sharing_agreements
    │   │   ├── core.user_consents
    │   │   └── core.user_data_exports
    │   ├── notifications.sql
    │   │   ├── Tables:
    │   │   ├── core.notifications
    │   │   ├── core.tagged_items
    │   │   └── core.tags
    │   ├── policies.sql
    │   ├── profiles.sql
    │   │   ├── Tables:
    │   │   ├── core.addresses
    │   │   └── core.profiles
    │   ├── user_groups.sql
    │   │   ├── Tables:
    │   │   └── core.user_groups
    │   └── user_permissions.sql
    │       ├── Tables:
    │       └── core.user_permissions
    ├── finance/
    │   ├── credit_transactions.sql
    │   │   ├── Tables:
    │   │   └── finance.credit_transactions
    │   ├── credits.sql
    │   │   ├── Tables:
    │   │   └── finance.credits
    │   ├── finance_schema.sql
    │   ├── invoice_items.sql
    │   ├── invoices.sql
    │   ├── payment_methods.sql
    │   │   ├── Tables:
    │   │   └── finance.payment_methods
    │   ├── subscription_items.sql
    │   │   ├── Tables:
    │   │   └── finance.subscription_items
    │   ├── subscriptions.sql
    │   │   ├── Tables:
    │   │   └── finance.subscriptions
    │   └── transactions.sql
    │       ├── Tables:
    │       └── finance.transactions
    ├── global/
    │   ├── 000_types.sql
    │   ├── global_schema.sql
    │   ├── user_variable_global_stats.sql
    │   │   └── Views:
    │   │   └── global.variable_global_stats (materialized)
    │   └── variable_global_stats.sql
    │       └── Views:
    │       └── global.variable_global_stats (materialized)
    ├── logistics/
    │   ├── inventory_transactions.sql
    │   │   ├── Tables:
    │   │   └── logistics.inventory_transactions
    │   ├── inventory.sql
    │   │   ├── Tables:
    │   │   └── logistics.inventory
    │   ├── logistics_schema.sql
    │   ├── return_items.sql
    │   │   ├── Tables:
    │   │   └── logistics.return_items
    │   ├── returns.sql
    │   │   ├── Tables:
    │   │   └── logistics.returns
    │   ├── shipment_items.sql
    │   │   ├── Tables:
    │   │   └── logistics.shipment_items
    │   ├── shipments.sql
    │   │   ├── Tables:
    │   │   └── logistics.shipments
    │   ├── shipping_methods.sql
    │   │   ├── Tables:
    │   │   ├── logistics.shipping_methods
    │   │   └── logistics.shipping_rates
    │   ├── shipping_rates.sql
    │   │   ├── Tables:
    │   │   └── logistics.shipping_rates
    │   └── warehouses.sql
    │       ├── Tables:
    │       └── logistics.warehouses
    ├── models/
    │   ├── calculation_views.sql
    │   │   └── Views:
    │   │   ├── models.annual_metabolic_impact (materialized)
    │   │   ├── models.cascading_outcome_effects (materialized)
    │   │   ├── models.cost_breakdown_summary (materialized)
    │   │   ├── models.daily_metabolic_impact (materialized)
    │   │   ├── models.health_outcomes (materialized)
    │   │   ├── models.intervention_outcome_effects (materialized)
    │   │   ├── models.long_term_projections (materialized)
    │   │   ├── models.medicare_impact_summary (materialized)
    │   │   ├── models.outcome_cost_impacts (materialized)
    │   │   ├── models.population_adjusted_effects (materialized)
    │   │   ├── models.population_benefits (materialized)
    │   │   ├── models.qaly_impact_summary (materialized)
    │   │   └── models.total_economic_impact (materialized)
    │   ├── cost_breakdowns.sql
    │   │   ├── Tables:
    │   │   └── models.cost_breakdowns
    │   ├── intervention_effects.sql
    │   │   ├── Tables:
    │   │   └── models.intervention_effects
    │   ├── model_equations.sql
    │   │   ├── Tables:
    │   │   ├── models.model_equations
    │   │   ├── Views:
    │   │   └── models.equation_dependencies
    │   ├── models_schema.sql
    │   ├── parameter_sets.sql
    │   │   ├── Tables:
    │   │   └── models.parameter_sets
    │   ├── parameter_sources.sql
    │   │   ├── Tables:
    │   │   └── models.parameter_sources
    │   ├── population_demographics.sql
    │   │   ├── Tables:
    │   │   └── models.population_demographics
    │   ├── simulation_outputs.sql
    │   │   ├── Tables:
    │   │   └── models.simulation_outputs
    │   └── statistical_validation.sql
    │       ├── Tables:
    │       └── models.statistical_validation
    ├── oauth2/
    │   ├── access_tokens.sql
    │   │   ├── Tables:
    │   │   └── oauth2.access_tokens
    │   ├── authorization_codes.sql
    │   │   ├── Tables:
    │   │   └── oauth2.authorization_codes
    │   ├── clients.sql
    │   │   ├── Tables:
    │   │   └── oauth2.clients
    │   ├── oauth2_schema.sql
    │   ├── refresh_tokens.sql
    │   │   ├── Tables:
    │   │   └── oauth2.refresh_tokens
    │   └── user_consents.sql
    │       ├── Tables:
    │       └── oauth2.user_consents
    ├── personal/
    │   ├── client_data_functions.sql
    │   ├── communication_functions.sql
    │   ├── communication_messages.sql
    │   │   ├── Tables:
    │   │   └── personal.communication_messages
    │   ├── communication_transcripts.sql
    │   │   └── Views:
    │   │   └── personal.communication_transcripts
    │   ├── data_imports.sql
    │   │   ├── Tables:
    │   │   └── personal.data_imports
    │   ├── extracted_data_points.sql
    │   │   ├── Tables:
    │   │   └── personal.extracted_data_points
    │   ├── import_processing_functions.sql
    │   ├── import_statistics.sql
    │   │   └── Views:
    │   │   ├── for
    │   │   └── personal.import_statistics
    │   ├── measurement_sources.sql
    │   │   └── Views:
    │   │   └── personal.measurement_sources
    │   ├── measurements.sql
    │   │   ├── Tables:
    │   │   └── personal.measurements
    │   ├── n1_trial_phases.sql
    │   │   ├── Tables:
    │   │   ├── personal.n1_trial_phases
    │   │   ├── Views:
    │   │   ├── for
    │   │   ├── personal.n1_trial_intervention_effectiveness
    │   │   ├── personal.n1_trial_phase_comparisons
    │   │   ├── personal.n1_trial_phase_effectiveness
    │   │   ├── personal.n1_trial_severity_analysis
    │   │   └── personal.n1_trial_severity_changes
    │   ├── personal_schema.sql
    │   ├── session_transcripts.sql
    │   │   └── Views:
    │   │   └── personal.checkin_session_transcripts
    │   ├── upcoming_notifications.sql
    │   │   └── Views:
    │   │   └── personal.upcoming_notifications
    │   ├── user_conditions.sql
    │   │   ├── Tables:
    │   │   └── personal.user_conditions
    │   ├── user_documents.sql
    │   │   ├── Tables:
    │   │   └── personal.user_documents
    │   ├── user_external_treatment_effectiveness_ratings.sql
    │   │   ├── Tables:
    │   │   └── personal.user_external_treatment_effectiveness_ratings
    │   ├── user_lab_results.sql
    │   │   ├── Tables:
    │   │   └── personal.user_lab_results
    │   ├── user_notifications.sql
    │   │   ├── Tables:
    │   │   └── personal.user_notifications
    │   ├── user_treatment_effectiveness_ratings.sql
    │   │   ├── Tables:
    │   │   └── personal.user_treatment_effectiveness_ratings
    │   ├── user_variable_relationship_stats.sql
    │   │   └── Views:
    │   │   └── personal.user_variable_relationship_stats (materialized)
    │   ├── user_variable_relationships.sql
    │   │   ├── Tables:
    │   │   └── personal.user_variable_relationships
    │   ├── user_variable_stats.sql
    │   │   └── Views:
    │   │   └── personal.user_variable_stats (materialized)
    │   ├── user_variables.sql
    │   │   ├── Tables:
    │   │   └── personal.user_variables
    │   └── variable_relationships.sql
    │       ├── Tables:
    │       └── personal.variable_relationships
    ├── reference/
    │   ├── data_quality_rules.sql
    │   │   ├── Tables:
    │   │   └── reference.data_quality_rules
    │   ├── data_sources.sql
    │   │   ├── Tables:
    │   │   └── reference.data_sources
    │   ├── lab_test_types.sql
    │   │   ├── Tables:
    │   │   └── reference.lab_test_types
    │   ├── population_segments.sql
    │   │   ├── Tables:
    │   │   └── reference.population_segments
    │   ├── reference_schema.sql
    │   ├── unit_categories.sql
    │   │   ├── Tables:
    │   │   └── reference.unit_categories
    │   ├── units_of_measurement.sql
    │   │   ├── Tables:
    │   │   └── reference.units_of_measurement
    │   ├── variable_categories.sql
    │   │   ├── Tables:
    │   │   └── reference.variable_categories
    │   ├── variable_ingredients.sql
    │   │   ├── Tables:
    │   │   └── reference.variable_ingredients
    │   ├── variable_relationships.sql
    │   │   ├── Tables:
    │   │   └── reference.variable_relationships
    │   ├── variable_synonyms.sql
    │   │   ├── Tables:
    │   │   └── reference.variable_synonyms
    │   └── variables.sql
    │       ├── Tables:
    │       └── reference.variables
    ├── scheduling/
    │   ├── appointment_feedback.sql
    │   │   ├── Tables:
    │   │   └── scheduling.appointment_feedback
    │   ├── appointment_reminders.sql
    │   │   ├── Tables:
    │   │   └── scheduling.appointment_reminders
    │   ├── appointments.sql
    │   │   ├── Tables:
    │   │   └── scheduling.appointments
    │   ├── provider_schedules.sql
    │   │   ├── Tables:
    │   │   └── scheduling.provider_schedules
    │   ├── provider_services.sql
    │   │   ├── Tables:
    │   │   └── scheduling.provider_services
    │   ├── schedule_exceptions.sql
    │   │   ├── Tables:
    │   │   └── scheduling.schedule_exceptions
    │   ├── scheduling_schema.sql
    │   ├── service_providers.sql
    │   │   ├── Tables:
    │   │   └── scheduling.service_providers
    │   └── service_types.sql
    │       ├── Tables:
    │       └── scheduling.service_types
    ├── seeds/
    │   └── muscle_mass_impact_seed.sql
    └── views/
        └── muscle_mass_impact_report.sql
            └── Views:
            └── models.muscle_mass_impact_report
```

