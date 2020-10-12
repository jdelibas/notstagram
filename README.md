# notstagram
> Feature incomplete instagram clone

## Getting started
> Install all the deps

```
npm i
```

> Run neo4j

```
docker run \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/neo4j/data:/data --env NEO4J_AUTH=neo4j/1337h4xx  \
    neo4j
```
* `.env` is configured with neo4j creds for speed


> Start dev server

```
npm run start:dev
```

### Swagger UI

http://localhost:3000/api/

- register a new user and copy the `access_token` in the Authorize modal (top right button)

### Neo4J Browser

http://localhost:7474/browser/
