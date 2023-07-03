# Captain of Industry blueprint parser

Does what it says on the label!

## Using coi-bp-parse

```
npm i coi-bp-parse
```

```
import {parseBlueprint} from 'coi-bp-parse';

const blueprint = parseBlueprint("B292:H4sIAAAAAAAACkWNwU7CQBRFZ4ZpsRWs4MK9cU1MjD8gEkMigYA/8Jw+y0vLvObNNIH489YFsrzn5p6rdfo0e5k9ux9jHUMzUMba27VQRR6ahY8UT8vyIZl+cEUhkgtL33ZxxSWq9O4frrt4psPiHT0KNBshln4+Vfoq2whHjqcWs/F8D/J3tYIaRefDLTpqMejr4ty8duLJV3qUfQr48M1ySIxSRg3sY2JT2wvH+e7ANe4iuFrn5mZyiYvjHroQi/sLmoN8sX8jPlKJepSotJf9AsaxV1f7AAAA")

/*blueprint
 {"libraryVersion":1,"gameVersion":"0.5.3c","saveVersion":123,"name":"coal","description":"","componentCounts":{"CharcoalMaker":1,"SmokeStack":1},"rawItems":[{"integers":{"OriginalEntityId":17,"LogisticsInputMode":0,"LogisticsOutputMode":0,"GeneralPriority":9},"strings":{"Prototype":"CharcoalMaker"},"booleans":{},"stringLists":{"Recipes":["CharcoalBurning"]},"byteArrays":{"Transform":{"0":2,"1":0,"2":0,"3":2,"4":0}}},{"integers":{"OriginalEntityId":18,"LogisticsInputMode":2,"LogisticsOutputMode":2},"strings":{"Prototype":"SmokeStack"},"booleans":{},"stringLists":{"Recipes":["SmokeStackExhaust","SmokeStackCarbonDioxide"]},"byteArrays":{"Transform":{"0":0,"1":6,"2":0,"3":2,"4":0}}}]}
*/
```
