import Exa, {RegularSearchOptions, SearchResult, ContentsOptions, TextContentsOptions} from "exa-js";
import { CacheService } from '@/lib/services/cache-service';

const exa = new Exa(process.env.EXA_API_KEY);
const cacheService = CacheService.getInstance();

const defaultTextOptions: TextContentsOptions = {
    maxCharacters: 10000,
    includeHtmlTags: false
};

type DefaultContentsOptions = {
    text: TextContentsOptions;
};

export async function getSearchResults(queries: string[], options?: RegularSearchOptions): Promise<SearchResult<DefaultContentsOptions>[]> {
    const results: SearchResult<DefaultContentsOptions>[] = [];
    for (const query of queries) {
        // Generate cache key based on query and options
        const cacheKey = `exa:${query}:${JSON.stringify(options)}`;
        
        // Try to get cached results
        const cachedResults = await cacheService.get<SearchResult<DefaultContentsOptions>[]>(cacheKey);
        if (cachedResults) {
            console.log(`Cache hit for Exa search: ${query}`);
            results.push(...cachedResults);
            continue;
        }

        // If not in cache, perform the search
        console.log(`Cache miss for Exa search: ${query}`);
        const searchResponse = await exa.searchAndContents(query, {
            numResults: options?.numResults ?? 5,
            useAutoprompt: options?.useAutoprompt ?? false,
            ...options,
            text: defaultTextOptions
        });
        
        // Cache the results
        await cacheService.set(cacheKey, searchResponse.results);
        results.push(...searchResponse.results);
    }
    return results;
}

export async function getSearchResultsByDomain(domain: string, queries: string[], options?: RegularSearchOptions): Promise<SearchResult<DefaultContentsOptions>[]> {
    const results: SearchResult<DefaultContentsOptions>[] = [];
    for (const query of queries) {
        // Generate cache key based on domain, query and options
        const cacheKey = `exa:domain:${domain}:${query}:${JSON.stringify(options)}`;
        
        // Try to get cached results
        const cachedResults = await cacheService.get<SearchResult<DefaultContentsOptions>[]>(cacheKey);
        if (cachedResults) {
            console.log(`Cache hit for Exa domain search: ${domain}:${query}`);
            results.push(...cachedResults);
            continue;
        }

        // If not in cache, perform the search
        console.log(`Cache miss for Exa domain search: ${domain}:${query}`);
        const searchResponse = await exa.searchAndContents(query, {
            numResults: options?.numResults ?? 5,
            useAutoprompt: options?.useAutoprompt ?? false,
            includeDomains: [domain],
            ...options,
            text: defaultTextOptions
        });
        
        // Cache the results
        await cacheService.set(cacheKey, searchResponse.results);
        results.push(...searchResponse.results);
    }
    return results;
}

export async function getSearchResultsByUrl(url: string, linksPerQuery: number = 5): Promise<SearchResult<DefaultContentsOptions>[]> {
    // Generate cache key based on URL and options
    const cacheKey = `exa:url:${url}:${linksPerQuery}`;
    
    // Try to get cached results
    const cachedResults = await cacheService.get<SearchResult<DefaultContentsOptions>[]>(cacheKey);
    if (cachedResults) {
        console.log(`Cache hit for Exa URL search: ${url}`);
        return cachedResults;
    }

    // If not in cache, perform the search
    console.log(`Cache miss for Exa URL search: ${url}`);
    const searchResponse = await exa.getContents(
        [url],
        {
          text: defaultTextOptions
        }
      );
    
    // Cache the results
    await cacheService.set(cacheKey, searchResponse.results);
    return searchResponse.results;
}
