This is a basic vue/vite/tailwind/daisy/dexie app.
Use it as a template, but change functionality.

## Features

This should be a habit tracker.
Keep the dexie persistence + google drive storage that's already set up.

We should the following views:

- Little overview dashboard
- Random Queue (randomly loads from the categories below, with a relevant UI)
- View for managing habits etc. with basic CRUD, using router subviews to manage:
  - habits: recurring things to do, with a minimum frequency in days, should have a toggle "do instantly"/"schedule"
  - evaluate: like habits, also minimum frequency, but for asking yourself questions like "are you happy with your exercise routine?"
  - todo: stuff that will be done at some point (& then archived), should have a toggle "do instantly"/"schedule"
- Settings: set stuff like google acc, and nr of items in queue per day

Setup cleanly. UTILIZE daisy ui!! Do not spam containers, cards and wrapper everywhere, but only when needed. Do not hallucinate extra features not asked for. Prefer clean routes over popup and modal hell.

Clean up unneeded components.
