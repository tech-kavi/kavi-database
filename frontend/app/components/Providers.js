'use client'

import { InstantSearch } from "react-instantsearch-hooks-web";
import algoliasearch from "algoliasearch"; // <-- default import
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

const router = createInstantSearchRouterNext();

export function Providers({ children }) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="development_api::expert.expert"
      routing={router} 
    >
      {children}
    </InstantSearch>
  );
}
// 'use client'

// import { InstantSearch } from "react-instantsearch-hooks-web";
// import algoliasearch from "algoliasearch";
// import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';
// import { createContext, useContext, useState } from 'react';

// const searchClient = algoliasearch(
//   process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
//   process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
// );

// const router = createInstantSearchRouterNext();

// const IndexContext = createContext({
//   indexName: 'development_api::expert.expert',
//   switchIndex: (newIndex) => {},
// });

// export const useIndex = () => useContext(IndexContext);

// export function Providers({ children }) {
//   const [indexName, setIndexName] = useState('development_api::expert.expert');

//   const switchIndex = (newIndex) => {
//     console.log(newIndex);
//     setIndexName(newIndex);
//   };

//   return (
//     <IndexContext.Provider value={{ indexName, switchIndex }}>
//       <InstantSearch key={indexName} searchClient={searchClient} indexName={indexName} routing={router}>
//         {children}
//       </InstantSearch>
//     </IndexContext.Provider>
//   );
// }
