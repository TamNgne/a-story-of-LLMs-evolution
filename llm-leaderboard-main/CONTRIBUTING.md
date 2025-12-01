# Contributing to LLM Stats

Thank you for your interest in contributing. This guide outlines the process for updating and adding information.

All data is organized in the `data/` directory:

- `data/models/` - Model metadata and configurations
- `data/providers/` - Provider information
- `data/provider_models/` - Provider-specific model pricing and features
- `data/benchmarks/` - Benchmark definitions
- `data/model_benchmarks/` - Model benchmark scores
- `data/organizations/` - Organization information
- `data/licenses/` - License definitions

## Table of Contents

- [General Guidelines](#general-guidelines)
- [Models](#models-🤖)
  - [Updating an Existing Model](#updating-an-existing-model)
  - [Adding a New Model](#adding-a-new-model)
- [Benchmark Results](#benchmark-results-📊)
  - [Adding and Updating Existing Benchmark Results](#adding-and-updating-existing-benchmark-results)
- [Providers](#providers-🏢)
  - [Updating an Existing Provider](#updating-an-existing-provider)
  - [Adding a New Provider](#adding-a-new-provider)
  - [Updating Provider Models](#updating-provider-models)
  - [Adding Provider Models](#adding-provider-models)
- [Organizations](#organizations-🏛️)
  - [Adding a New Organization](#adding-a-new-organization)
- [Licenses](#licenses-📜)
  - [Adding a New License](#adding-a-new-license)
- [Submitting Your Contribution](#submitting-your-contribution-🚀)

## General Guidelines

1. Ensure data accuracy and provide authoritative references
2. Follow the existing file structure and naming conventions
3. Maintain consistent formatting and style
4. Submit one pull request per model or provider change
5. All data files must validate against their respective JSON schemas

## Models 🤖

### Updating an Existing Model

1. Locate the model in `data/models/[model_id].json`
2. Update the relevant fields with new information
3. Ensure all changes are accurate and properly sourced
4. Validate against `schemas/models-db-schema.json`

### Adding a New Model

Location: `data/models/[model_id].json`

1. Create a new JSON file that matches the `schemas/models-db-schema.json` schema
2. Ensure the organization exists in `data/organizations/`
3. Ensure the license exists in `data/licenses/`

## Benchmark Results 📊

### Adding and Updating Existing Benchmark Results

1. Ensure the benchmark exists in `data/benchmarks/[benchmark_id].json`
2. Create or update the entry in `data/model_benchmarks/[model_benchmark_id].json`
3. Ensure the `source_link` is reliable and up-to-date
4. Validate against `schemas/model-benchmarks-schema.json`

## Providers 🏢

### Updating an Existing Provider

1. Locate the provider in `data/providers/[provider_id].json`
2. Update the relevant fields with new information
3. Validate against `schemas/providers-schema.json`

### Adding a New Provider

Location: `data/providers/[provider_id].json`

1. Create a new JSON file that matches the `schemas/providers-schema.json` schema

### Adding and Updating Provider Models

1. Create or update entries in `data/provider_models/[model_provider_id].json`
2. Ensure both the model and provider exist in their respective directories
3. Validate against `schemas/provider-models-schema.json`

## Organizations 🏛️

### Adding a New Organization

Location: `data/organizations/[organization_id].json`

1. Create a new JSON file that matches the `schemas/organizations-schema.json` schema

## Licenses 📜

### Adding a New License

Location: `data/licenses/[license_id].json`

1. Create a new JSON file that matches the `schemas/licenses-schema.json` schema

## Submitting Your Contribution 🚀

1. Fork the repository
2. Make your changes in a new branch
3. Submit a pull request with a clear description of your changes

Optionally you can run `node schemas/validator.js` to validate your changes against the schema. This will be run automatically on your Pull Request as well.

For an example of a well-structured pull request, see [this example](https://github.com/JonathanChavezTamales/llm-leaderboard/pull/1).
