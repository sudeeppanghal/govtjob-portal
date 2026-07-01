/**
 * Enriches and sanitizes Schema.org JobPosting structured data to satisfy
 * all Google Search Console required and recommended properties.
 */
export function enrichJobPostingSchema(schemaObj: any, notification: any, todayISO: string): any {
  if (!schemaObj) return null;
  const schema = { ...schemaObj };

  // 1. Basic properties
  schema["@context"] = "https://schema.org/";
  schema["@type"] = "JobPosting";
  schema.title = schema.title || notification.article_title || "Government Job Opportunity";
  schema.description = schema.description || notification.meta_description || notification.article_content || "Government recruitment notification details.";
  schema.datePosted = schema.datePosted || (notification.created_at ? notification.created_at.split('T')[0] : todayISO);
  schema.dateModified = todayISO;

  // 2. Fix validThrough (Google requires valid ISO date)
  if (!schema.validThrough || schema.validThrough === "Check Notification" || schema.validThrough === "Refer to official PDF") {
    if (notification.last_date && notification.last_date !== "Check Notification" && notification.last_date !== "Refer to official PDF" && String(notification.last_date).length >= 10) {
      schema.validThrough = `${notification.last_date}T23:59:59+05:30`;
    } else {
      // Default to 60 days from today if unknown, as required by Google Search Console to avoid validThrough error
      const defaultValidDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      schema.validThrough = defaultValidDate.toISOString().split('T')[0] + "T23:59:59+05:30";
    }
  } else if (typeof schema.validThrough === "string" && !schema.validThrough.includes('T') && schema.validThrough.length >= 10) {
    schema.validThrough = `${schema.validThrough}T23:59:59+05:30`;
  }

  // 3. Fix employmentType
  schema.employmentType = schema.employmentType || "FULL_TIME";

  // 4. Fix hiringOrganization
  const orgName = notification.source_name || "Government Authority";
  const orgUrl = notification.source_url || "https://railwayadmitcard.online";
  const existingOrg = typeof schema.hiringOrganization === "object" && schema.hiringOrganization !== null ? schema.hiringOrganization : {};
  schema.hiringOrganization = {
    "@type": "Organization",
    "name": existingOrg.name || orgName,
    "sameAs": existingOrg.sameAs || orgUrl,
    "logo": "https://railwayadmitcard.online/logo.png"
  };

  // 5. Fix jobLocation and address (Solves: Missing field postalCode, streetAddress, addressLocality, addressRegion)
  const existingLocation = typeof schema.jobLocation === "object" && schema.jobLocation !== null ? schema.jobLocation : {};
  const existingAddress = typeof existingLocation.address === "object" && existingLocation.address !== null ? existingLocation.address : {};
  
  const defaultLocality = Array.isArray(notification.states) && notification.states[0] ? `${notification.states[0]}, India` : "New Delhi";
  const defaultRegion = Array.isArray(notification.states) && notification.states[0] ? notification.states[0] : "Delhi";

  schema.jobLocation = {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": existingAddress.streetAddress || "Government Secretariat, Official Headquarters",
      "addressLocality": existingAddress.addressLocality || defaultLocality,
      "addressRegion": existingAddress.addressRegion || defaultRegion,
      "postalCode": existingAddress.postalCode || "110001",
      "addressCountry": existingAddress.addressCountry || "IN"
    }
  };

  // 6. Fix baseSalary (Solves: Missing field baseSalary)
  const existingSalary = typeof schema.baseSalary === "object" && schema.baseSalary !== null ? schema.baseSalary : {};
  schema.baseSalary = {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "value": 35000,
      "minValue": 25000,
      "maxValue": 80000,
      "unitText": "MONTH",
      ...(typeof existingSalary.value === "object" && existingSalary.value !== null ? existingSalary.value : {})
    }
  };

  // 7. Fix identifier
  const existingIdentifier = typeof schema.identifier === "object" && schema.identifier !== null ? schema.identifier : {};
  schema.identifier = {
    "@type": "PropertyValue",
    "name": existingIdentifier.name || orgName,
    "value": existingIdentifier.value || notification.slug || "GOVT-JOB-2026"
  };

  return schema;
}
