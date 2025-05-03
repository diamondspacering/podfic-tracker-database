#!/bin/bash

# Define file paths
ENV_FILE=".env"
TAG_MAPPINGS_FILE="src/scripts/tag_mappings.json"
DATA_PERSONAL_FILE="src/app/lib/dataPersonal.ts"

# Check for .env file
# TODO: more detailed options here?
if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found. Creating one..."
  read -p "Enter the database connection string: " CONNECTION_STRING
  echo "CONNECTION_STRING=\"$CONNECTION_STRING\"" > "$ENV_FILE"
  echo "USE_LOCAL='0'" >> "$ENV_FILE"
  echo ".env file created with CONNECTION_STRING."
else
  echo ".env file already exists."
fi

# Create tag_mappings.json with sample data if it doesn't exist
if [ ! -f "$TAG_MAPPINGS_FILE" ]; then
  echo "Creating tag_mappings.json with sample data..."
  cat > "$TAG_MAPPINGS_FILE" <<EOL
{
  "fandom_mapping": {},
  "relationship_mapping": {},
  "character_mapping": {}
}
EOL
  echo "tag_mappings.json created."
else
  echo "tag_mappings.json already exists."
fi

# Create dataPersonal.ts with sample data if it doesn't exist
if [ ! -f "$DATA_PERSONAL_FILE" ]; then
  echo "Creating dataPersonal.ts with sample data..."
  cat > "$DATA_PERSONAL_FILE" <<EOL
export const mics = ['Mic 1', 'Mic 2'];
export const devices = ['Laptop', 'Phone'];
export const locations = ['Closet', 'Desk'];
EOL
  echo "dataPersonal.ts created."
else
  echo "dataPersonal.ts already exists."
fi

echo "Setup complete."