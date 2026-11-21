import { test, expect } from "@playwright/test";

test("Mocked Events use on events catalog and event details page", async ({ page }) => {
    // Sign in through the real application.
    await page.goto("/login");
    await page.getByLabel("Email").fill("sktester@gmail.com");
    await page.getByLabel("Password").fill("Secret@123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("link", { name: "Browse Events →" })).toBeVisible();

    // Both the catalog and detail event route use this data.
    const mockData = [
        {
            id: 412,
            title: "Hyderabad FutureTech & AI Summit 2026",
            description: "Join industry pioneers, AI researchers, and digital innovators in the heart of HITEC City for a two-day deep dive into generative systems, immersive media installations, and next-gen cloud architecture. Featuring live interactive demos, keynote panels, and executive networking lounges.",
            category: "Conference",
            venue: "Hyderabad International Convention Centre (HICC)",
            city: "Hyderabad",
            eventDate: "2026-12-12T09:30:00.000Z",
            price: "2500",
            totalSeats: 1500,
            availableSeats: 142,
            imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
            isStatic: true,
            userId: null,
            createdAt: "2026-10-05T11:20:45.120Z",
            updatedAt: "2026-11-19T10:33:00.000Z",
        },
        {
            id: 508,
            title: "Jashn-e-Rekhta Urdu Heritage Festival",
            description: "Experience three days of soulful Sufi music, mushairas, dramatic storytelling, and traditional Dastangoi performances celebrating the richness of Urdu literature and culture. Explore bustling heritage food bazaars and calligraphy workshops across the open lawns.",
            category: "Festival",
            venue: "Major Dhyan Chand National Stadium",
            city: "Delhi",
            eventDate: "2026-12-18T11:00:00.000Z",
            price: "500",
            totalSeats: 8000,
            availableSeats: 10,
            imageUrl: "https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D0",
            isStatic: true,
            userId: null,
            createdAt: "2026-10-12T08:15:30.400Z",
            updatedAt: "2026-11-18T14:22:10.115Z",
        },
        {
            id: 619,
            title: "Echoes of the Arabian Sea: Indie & Electronic Night",
            description: "An electrifying open-air concert featuring India's top indie-pop bands and progressive electronic producers under the stars. Enjoy state-of-the-art spatial sound, immersive laser visuals, and curated coastal food trucks.",
            category: "Concert",
            venue: "Mahalaxmi Racecourse",
            city: "Mumbai",
            eventDate: "2027-01-16T18:30:00.000Z",
            price: "1800",
            totalSeats: 5000,
            availableSeats: 64,
            imageUrl: "https://images.unsplash.com/photo-1758550445758-165aeab5b26e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
            isStatic: true,
            userId: null,
            createdAt: "2026-11-01T13:40:12.900Z",
            updatedAt: "2026-11-19T09:10:05.820Z",
        },
        {
            id: 734,
            title: "Hands-On Robotics & Edge AI Prototyping Workshop",
            description: "A full-day practical bootcamp designed for hardware enthusiasts and software developers to build and deploy real-time computer vision models on edge microcontrollers. All sensor kits, boards, and lunch are provided at the venue.",
            category: "Workshop",
            venue: "Bangalore International Centre (BIC), Domlur",
            city: "Bangalore",
            eventDate: "2026-12-06T10:00:00.000Z",
            price: "1200",
            totalSeats: 60,
            availableSeats: 9,
            imageUrl: "https://images.unsplash.com/photo-1743677077216-00a458eff9e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
            isStatic: true,
            userId: null,
            createdAt: "2026-10-25T16:05:44.310Z",
            updatedAt: "2026-11-19T11:45:19.605Z",
        },
    ];

    // Register the catalog mock before opening Events.
    // The wildcard allows search, category, city, and other query values to vary.
    await page.route("https://api.eventhub.rahulshettyacademy.com/api/events?**", async (route) => {

        const requestUrl = new URL(route.request().url());

        const search = requestUrl.searchParams.get("search");
        const category = requestUrl.searchParams.get("category");
        const city = requestUrl.searchParams.get("city");

        // Every request starts from the original four events.
        // filter() creates new arrays without changing mockData.
        let filteredEvents = mockData;
        if (search !== "" && search !== null) {
            filteredEvents = filteredEvents.filter(
                (event) => event.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (category !== "" && category !== null) {
            filteredEvents = filteredEvents.filter(
                (event) => event.category === category);
        }
        if (city !== "" && city !== null) {
            filteredEvents = filteredEvents.filter(
                (event) => event.city === city);
        }

        // Save the API response structure and update the result counts
        const body = {
            success: true,
            data: filteredEvents,
            pagination: {
                total: filteredEvents.length,
                page: 1,
                limit: 12,
                totalPages: Math.ceil(filteredEvents.length / 12),
            },
        };

        // Supply mock data directly without requesting the live catalog
        await route.fulfill({ json: body });
    });

    const hyderabadEvent = mockData.find((event) => { return event.id === 412 });

    // Register the detail event mock before navigation.
    // The detail page receives the same record used by the catalog.
    await page.route("https://api.eventhub.rahulshettyacademy.com/api/events/412", async (route) => {
        await route.fulfill({ json: { success: true, data: hyderabadEvent } });
    });

    await page.getByRole("link", { name: "Browse Events →" }).click();

    // Verify that all four mocked events appear and the live title is absent.
    await expect(page.getByRole("heading", { name: "Upcoming Events", level: 1 })).toBeVisible();
    await expect(page.getByText("Hyderabad FutureTech & AI Summit 2026")).toBeVisible();
    await expect(page.getByText("Jashn-e-Rekhta Urdu Heritage Festival")).toBeVisible();
    await expect(page.getByText("Echoes of the Arabian Sea: Indie & Electronic Night")).toBeVisible();
    await expect(page.getByText("Hands-On Robotics & Edge AI Prototyping Workshop")).toBeVisible();
    await expect(page.getByRole("link", { name: "World Tech Summit" })).toHaveCount(0);
    const cards = page.getByTestId("event-card");
    const hyderabadCard = cards.filter({ hasText: hyderabadEvent.title });
    await expect(cards).toHaveCount(4);

    // Check every mock card against its own record.
    for (const event of mockData) {
        const eventCard = cards.filter({ hasText: event.title });
        await expect(eventCard).toHaveCount(1);
        const price = Number(event.price);
        const formattedPrice = price.toLocaleString("en-US");
        await expect(eventCard.getByText(`$${formattedPrice}`, { exact: true })).toBeVisible();
        if (event.availableSeats <= 10) { await expect(eventCard.getByText(`${event.availableSeats} seats left!`)).toBeVisible() }
        else { await expect(eventCard.getByText(`${event.availableSeats} seats available`)).toBeVisible() }
        const titleLink = eventCard.getByRole("link", { name: event.title });
        await expect(titleLink).toHaveAttribute("href", `/events/${event.id}`);
        const booknowLink = eventCard.getByRole("link", { name: "Book Now" });
        await expect(booknowLink).toHaveAttribute("href", `/events/${event.id}`);
    }

    // Apply the search, category, and city filters through the UI.
    await page.getByPlaceholder("Search events, venues…").fill("FutureTech");
    await page.getByRole("combobox").filter({ hasText: "All Categories" }).selectOption({ value: "Conference" });
    await page.getByRole("combobox").filter({ hasText: "All Cities" }).selectOption({ value: "Hyderabad" });
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText(hyderabadEvent.title);

    await hyderabadCard.getByRole("link", { name: "Book Now" }).click();

    // Verify the detail page belongs to the selected mock event.
    await expect(page).toHaveURL(`/events/${hyderabadEvent.id}`);
    await expect(page.getByRole("heading", { name: hyderabadEvent.title })).toBeVisible();

    // Constant and assertions on detail event page like price, venue, city, seats, total
    const hydPrice = Number(hyderabadEvent.price);
    const hydFormattedPrice = hydPrice.toLocaleString("en-US");
    const hydTicketPrice = page.getByText("Price per ticket", { exact: true }).locator("..").locator("p").nth(1);
    await expect(hydTicketPrice).toHaveText(`$${hydFormattedPrice}`);
    const hydVenue = page.getByText("Venue", { exact: true }).locator("..").locator("p").nth(1);
    await expect(hydVenue).toHaveText(hyderabadEvent.venue);
    const hydCity = page.getByText("City", { exact: true }).locator("..").locator("p").nth(1);
    await expect(hydCity).toHaveText(hyderabadEvent.city);
    const hydavailSeats = page.getByText("Available", { exact: true }).locator("..").locator("p").nth(1);
    await expect(hydavailSeats).toHaveText(`${hyderabadEvent.availableSeats} / ${hyderabadEvent.totalSeats} seats`)
    await expect(page.locator("#ticket-count")).toHaveText("1");
    const hydTotal = page.getByText("Total", { exact: true }).locator("..").locator("span").nth(1);
    await expect(hydTotal).toHaveText(`$${hydFormattedPrice}`);
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.locator("#ticket-count")).toHaveText("2");
    const hydnewTotal = Number(hyderabadEvent.price) * 2;
    const formattednewTotal = hydnewTotal.toLocaleString("en-US");
    await expect(hydTotal).toHaveText(`$${formattednewTotal}`);

});
