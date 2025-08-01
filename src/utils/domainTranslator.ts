interface DomainMapping {
  [key: string]: string;
}

const ASN_DOMAINS_URL = 'https://asenturisk.github.io/asn/domains.json';

let cachedDomains: DomainMapping | null = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function translateAsnDomain(url: string): Promise<string | null> {
  try {
    // Extract the .asn domain from the URL
    let domain = url;
    if (url.includes('/')) {
      domain = url.split('/')[0];
    }
    if (!domain.endsWith('.asn')) {
      domain += '.asn';
    }

    // Get domain mappings
    const domains = await fetchDomainMappings();
    
    if (domains && domains[domain]) {
      const targetUrl = domains[domain];
      
      // If the original URL had a path, append it
      if (url.includes('/') && url !== domain) {
        const path = url.substring(url.indexOf('/'));
        return targetUrl + (targetUrl.endsWith('/') ? path.substring(1) : path);
      }
      
      return targetUrl;
    }

    return null;
  } catch (error) {
    console.error('Error translating .asn domain:', error);
    return null;
  }
}

async function fetchDomainMappings(): Promise<DomainMapping | null> {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedDomains && (now - lastFetch) < CACHE_DURATION) {
    return cachedDomains;
  }

  try {
    const response = await fetch(ASN_DOMAINS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const domains: DomainMapping = await response.json();
    
    // Cache the result
    cachedDomains = domains;
    lastFetch = now;
    
    return domains;
  } catch (error) {
    console.error('Error fetching domain mappings:', error);
    
    // Return cached data as fallback if available
    if (cachedDomains) {
      return cachedDomains;
    }
    
    // Return hardcoded fallback
    return {
      "trend.asn": "https://trend.muxday.com/",
      "asenturisk.asn": "https://asenturisk.web.app/",
      "mukto.asn": "https://muxday.com/mukto/"
    };
  }
}

export function clearDomainCache(): void {
  cachedDomains = null;
  lastFetch = 0;
}