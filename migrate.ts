import 'dotenv/config';
import { getPayload } from 'payload';
import config from './src/payload.config';

const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;
const EXTERNAL_PRODUCTS_API_URL = process.env.EXTERNAL_PRODUCTS_API;
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;

type NetworkType = {
    name: string;
    types: string[];
};

type Coverage = {
    country_name: string;
    networks: NetworkType[];
};

type Country = {
    country_code: string;
    name: string;
    image: string;
};

type Plan = {
    id: number;
    sku: string;
    provider_id: number;
    name: string;
    data: string;
    custom_price: number;
    public_price: number;
    cost: number;
    description: string;
    rechargeability: number;
    duration: number;
    data_amount: number | null;
    is_unlimited: number;
    price_range: unknown[];
    extra_info: string | null;
    voice: string | null;
    text: string | null;
};

export type Destination = {
    id: number;
    name: string;
    code: string;
    custom_code: string | null;
    status: number;
    type: string;
    apn_value: string | null;
    image_url: string;
    created_at: string;
    updated_at: string;
    provider: string;
    plans: Plan[];
    coverages: Coverage[];
    countries: Country[];
};

type ApiResponse = {
    data: Destination[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    success: boolean;
};

async function fetchAllDestinations(): Promise<Destination[]> {
    const allDestinations: Destination[] = [];
    let currentPage = 1;
    let hasNextPage = true;

    console.log("Fetching destinations from API...");

    if (!EXTERNAL_PRODUCTS_API_URL || !EXTERNAL_API_KEY) {
        console.error("Missing required environment variables: EXTERNAL_API_KEY or EXTERNAL_PRODUCTS_API");
        return [];
    }

    while (hasNextPage) {
        const url = `${EXTERNAL_PRODUCTS_API_URL}?page=${currentPage}`;
        console.log(`Fetching page ${currentPage}...`);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${EXTERNAL_API_KEY}`
            }
        });

        if (!response.ok) {
            console.error(`Error fetching page ${currentPage}:`, response.status, response.statusText);
            const text = await response.text();
            console.error("Response body:", text);
            break;
        }

        const apiResponse: ApiResponse = await response.json();

        if (!apiResponse.success || !apiResponse.data) {
            console.error("API response was not successful or data is missing");
            break;
        }

        allDestinations.push(...apiResponse.data);
        console.log(`Fetched ${apiResponse.data.length} destinations from page ${currentPage}`);

        hasNextPage = apiResponse.meta.current_page < apiResponse.meta.last_page;
        currentPage++;
    }

    console.log(`Total destinations fetched: ${allDestinations.length}`);
    return allDestinations;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Cache for country IDs to avoid duplicate lookups
const countryCache = new Map<string, string>();

async function findOrCreateCountry(
    payload: Awaited<ReturnType<typeof getPayload>>,
    country: Country
): Promise<string> {
    // Check cache first
    if (countryCache.has(country.country_code)) {
        return countryCache.get(country.country_code)!;
    }

    // Try to find existing country by code
    const existingCountry = await payload.find({
        collection: 'countries',
        where: {
            code: {
                equals: country.country_code,
            },
        },
        limit: 1,
    });

    if (existingCountry.docs.length > 0) {
        const id = existingCountry.docs[0].id;
        countryCache.set(country.country_code, id);
        return id;
    }

    // Create new country
    const slug = generateSlug(country.name);
    const newCountry = await payload.create({
        collection: 'countries',
        data: {
            name: country.name,
            code: country.country_code,
            flagUrl: country.image,
            slug,
        },
    });

    console.log(`  Created country: ${country.name} (${country.country_code})`);
    countryCache.set(country.country_code, newCountry.id);
    return newCountry.id;
}

async function importDestinationsToPayload(destinations: Destination[]): Promise<void> {
    if (!PAYLOAD_SECRET) {
        console.error("Missing PAYLOAD_SECRET environment variable");
        return;
    }

    console.log("Initializing Payload...");
    const payload = await getPayload({ config });

    console.log("Creating or finding 'Plan' variant type...");
    const planVariantType = await payload.find({
        collection: 'variantTypes',
        where: {
            name: {
                equals: 'plan',
            },
        },
        limit: 1,
    });

    let planVariantTypeId: string;

    if (planVariantType.docs.length === 0) {
        console.log("Creating new 'Plan' variant type...");
        const newVariantType = await payload.create({
            collection: 'variantTypes',
            data: {
                label: 'Plan',
                name: 'plan',
            },
        });
        planVariantTypeId = newVariantType.id;
    } else {
        planVariantTypeId = planVariantType.docs[0].id;
        console.log(`Found existing 'Plan' variant type with ID: ${planVariantTypeId}`);
    }

    console.log("Starting import process...");
    let successCount = 0;
    let errorCount = 0;

    for (const destination of destinations) {
        try {
            console.log(`\nProcessing destination: ${destination.name} (${destination.code})`);
            console.log(`  Plans found: ${destination.plans?.length || 0}`);
            console.log(`  Countries found: ${destination.countries?.length || 0}`);
            if (destination.plans?.length > 0) {
                console.log(`  First plan: ${destination.plans[0].name} - ${destination.plans[0].data}`);
            }

            // Create or find countries for this destination
            const countryIds: string[] = [];
            if (destination.countries && destination.countries.length > 0) {
                for (const country of destination.countries) {
                    const countryId = await findOrCreateCountry(payload, country);
                    countryIds.push(countryId);
                }
            }

            const slug = generateSlug(`${destination.name}-${destination.code}`);

            const existingProduct = await payload.find({
                collection: 'products',
                where: {
                    slug: {
                        equals: slug,
                    },
                },
                limit: 1,
            });

            // Build coverage text
            const coverageText = destination.coverages?.length > 0
                ? destination.coverages.map(coverage =>
                    `${coverage.country_name}: ${coverage.networks.map(n => `${n.name} (${n.types.join(', ')})`).join(', ')}`
                  ).join('\n')
                : '';

            // Map destination type to esimType
            const esimType = destination.type === 'local' ? 'local'
                : destination.type === 'regional' ? 'regional'
                : 'global';

            if (existingProduct.docs.length > 0) {
                // Update existing product with all fields
                const existingProductId = existingProduct.docs[0].id;
                console.log(`Product with slug "${slug}" already exists. Updating...`);

                await payload.update({
                    collection: 'products',
                    id: existingProductId,
                    data: {
                        countries: countryIds,
                        provider: destination.provider,
                        esimType: esimType as 'local' | 'regional' | 'global',
                        coverage: coverageText,
                        iconUrl: destination.image_url,
                    },
                });

                console.log(`✓ Updated product "${slug}" with ${countryIds.length} countries`);
                successCount++;
                continue;
            }

            const hasPlans = destination.plans && destination.plans.length > 0;

            const productData = {
                title: destination.name,
                slug: slug,
                iconUrl: destination.image_url,
                provider: destination.provider,
                esimType: esimType as 'local' | 'regional' | 'global',
                coverage: coverageText,
                enableVariants: hasPlans,
                variantTypes: hasPlans ? [planVariantTypeId] : [],
                priceInUSDEnabled: !hasPlans,
                priceInUSD: !hasPlans && destination.plans?.length > 0 ? destination.plans[0].public_price : 0,
                inventory: hasPlans ? 0 : 999,
                countries: countryIds,
                _status: 'published' as const,
            };

            const createdProduct = await payload.create({
                collection: 'products',
                data: productData,
            });

            console.log(`✓ Created product: ${createdProduct.title} (ID: ${createdProduct.id})`);

            if (hasPlans) {
                console.log(`  Creating ${destination.plans.length} plan variants...`);

                for (const plan of destination.plans) {
                    const variantOptionLabel = `${plan.data} - ${plan.duration} days`;
                    const variantOptionValue = `${plan.data.toLowerCase().replace(/\s+/g, '-')}-${plan.duration}d`;

                    const variantOption = await payload.find({
                        collection: 'variantOptions',
                        where: {
                            and: [
                                {
                                    variantType: {
                                        equals: planVariantTypeId,
                                    },
                                },
                                {
                                    value: {
                                        equals: variantOptionValue,
                                    },
                                },
                            ],
                        },
                        limit: 1,
                    });

                    let variantOptionId: string;

                    if (variantOption.docs.length === 0) {
                        const newVariantOption = await payload.create({
                            collection: 'variantOptions',
                            data: {
                                variantType: planVariantTypeId,
                                label: variantOptionLabel,
                                value: variantOptionValue,
                            },
                        });
                        variantOptionId = newVariantOption.id;
                    } else {
                        variantOptionId = variantOption.docs[0].id;
                    }

                    // Detect unlimited plans by checking:
                    // 1. is_unlimited field (if set correctly)
                    // 2. data_amount is null (no data limit)
                    // 3. plan name contains "Unlimited" or "unlimited"
                    const isUnlimited =
                        plan.is_unlimited === 1 ||
                        plan.data_amount === null ||
                        plan.name.toLowerCase().includes('unlimited') ||
                        plan.data.toLowerCase().includes('unlimited');

                    const planType = isUnlimited ? 'unlimited' : 'limited';

                    await payload.create({
                        collection: 'variants',
                        data: {
                            title: `${destination.name} — ${variantOptionLabel}`,
                            product: createdProduct.id,
                            options: [variantOptionId],
                            priceInUSDEnabled: true,
                            priceInUSD: plan.public_price,
                            inventory: 999,
                            planType,
                            _status: 'published' as const,
                        },
                        context: {
                            skipPlanTypeValidation: true,
                        },
                    });

                    console.log(`    ✓ Created variant: ${variantOptionLabel} - $${plan.public_price} (${planType})`);
                }
            }

            successCount++;

        } catch (error) {
            console.error(`✗ Error importing destination ${destination.name}:`, error);
            errorCount++;
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("Import Summary:");
    console.log(`Total destinations processed: ${destinations.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(50));
}

async function main(): Promise<void> {
    try {
        const destinations = await fetchAllDestinations();

        if (destinations.length === 0) {
            console.log("No destinations to import.");
            return;
        }

        await importDestinationsToPayload(destinations);

        console.log("\nMigration completed!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

main();
