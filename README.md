# Tatawwu' — Volunteering in Bahrain

![Status](https://img.shields.io/badge/Status-Active-blue.svg)
![Website](https://img.shields.io/badge/Website-Live-222222?logo=vercel)

![Tatawwu wordmark: volunteering in Bahrain](src/assets/tatawwu-logo.svg)

Tatawwu' brings charitable, volunteer, and humanitarian campaigns in Bahrain into one place. Volunteers can discover activities, save favorites, share campaign links, and track participation. Organizers can publish activities and certificates for the participants after admin review the campaigns.

**Live website:** [tatawuu-frontend.vercel.app](https://tatawuu-frontend.vercel.app/)
**Live backend:** [tatawwubackend.onrender.com](https://tatawwubackend.onrender.com)

**Repositories:** [Frontend — React](https://github.com/ctarek2015-wq/tatawuu-frontend) · [Backend — Express and MongoDB](https://github.com/EshaAbbasi/TatawwuBackend)

1. [AAU user stories](#1-aau-user-stories)
2. [Entity relationship diagrams](#2-entity-relationship-diagrams-erds)
3. [Application pages](#3-application-pages)
4. [Routes](#4-routes)
5. [Component hierarchy](#5-component-hierarchy)

### Getting started

- **Live demo (frontend):** [https://tatawuu-frontend.vercel.app/](https://tatawuu-frontend.vercel.app/)
- **Live backend:** [https://tatawwubackend.onrender.com](https://tatawwubackend.onrender.com)
- **Deployment:** configure the environments below, then deploy the frontend and backend separately.
- **Planning:** [team Trello board](https://trello.com/b/SZ3tg7mp/tatawuu).
- **Frontend repository:** [ctarek2015-wq/tatawuu-frontend](https://github.com/ctarek2015-wq/tatawuu-frontend).
- **Backend repository:** [EshaAbbasi/TatawwuBackend](https://github.com/EshaAbbasi/TatawwuBackend).

#

## Team

- Esha Ashfar
- Ahmed Tarek
- Hassan Mohammad Saeed

#

## 1. AAU user stories

### Visitors

| ID  | User story                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| U01 | As a visitor, I want to browse approved volunteering activities in Bahrain so that I can find opportunities to participate.                      |
| U02 | As a visitor, I want to filter campaigns by governorate, area, category, and date so that I can find suitable activities.                        |
| U03 | As a visitor, I want to view campaign images, Bahrain time, venue, and organization information so that I understand an activity before joining. |
| U04 | As a visitor, I want to create a volunteer or organizer account so that I can use the platform.                                                  |
| U05 | As a user, I want to sign in and sign out so that I can securely access my account.                                                              |
| U06 | As a user, I want to edit my name and optional city so that my profile stays accurate.                                                           |
| U07 | As a visitor, I want to copy a public campaign's link so that I can share the opportunity with others.                                           |
| U08 | As a visitor, I want to open an organization's public email, phone, or WhatsApp contact link so that I can ask about a campaign.                 |

### Volunteers

| ID  | User story                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| V01 | As a volunteer, I want to register for an available campaign so that I can immediately reserve a place.                     |
| V02 | As a volunteer, I want to cancel before the activity starts so that another person can use my place.                        |
| V03 | As a volunteer, I want to view upcoming and past registrations so that I can track my participation.                        |
| V04 | As a volunteer, I want to see my attendance status so that I know whether my participation was recorded.                    |
| V05 | As a volunteer, I want to preview and download my certificates so that I have a record of my contribution.                  |
| V06 | As a volunteer, I want to save, view, and remove favorite campaigns so that I can return to opportunities that interest me. |

### Organizers

| ID  | User story                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| O01 | As an organizer, I want to create and edit my Bahrain organization profile so that I can submit it for approval.                              |
| O02 | As an organizer, I want to upload, replace, or remove my organization's logo so that volunteers can recognize it.                             |
| O03 | As an organizer, I want to create and view campaign drafts so that I can prepare activities in Bahrain.                                       |
| O04 | As an organizer, I want to edit campaign information and its cover image before the activity starts so that the listing stays accurate.       |
| O05 | As an organizer, I want to delete unused unpublished campaigns so that I can remove unnecessary drafts.                                       |
| O06 | As an organizer, I want to submit campaigns for approval and read rejection feedback so that I can get them published.                        |
| O07 | As an organizer, I want to cancel a published campaign so that participants can see that it will not take place.                              |
| O08 | As an organizer, I want to view participants and record attendance after an activity so that participation is documented.                     |
| O09 | As an organizer, I want to complete a campaign after recording attendance so that attendees become eligible for certificates.                 |
| O10 | As an organizer, I want to grant certificates to eligible attendees so that their user IDs are recorded in the campaign's certificate grants. |

### Admins

| ID  | User story                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------- |
| A01 | As an admin, I want to review organization information, location, and logo so that I can approve Bahrain-based organizations.    |
| A02 | As an admin, I want to review each campaign's details, location, and image so that I can approve suitable activities in Bahrain. |
| A03 | As an admin, I want to reject or remove inappropriate content with feedback so that organizers understand my decision.           |

## 2. Entity relationship diagrams (ERDs)

The application uses **three MongoDB models**. Participants are embedded in Campaign, following the embedded-comments approach in the Hoots example. There is no Registration model, controller, or collection used by this version.

| Model        | Main fields and relationships                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User         | `username`, hashed `password`, `name`, optional `city`, and `role` (`Volunteer`, `Organizer`, `Admin`).                                                                                                                                   |
| Organization | One `ownerId` referencing User; name, description, Bahrain location, public contacts, `logo`, `logoPublicId`, optional `latitude`/`longitude`, status, and review feedback.                                                               |
| Campaign     | `organizationId`, title, description, category, Bahrain location, venue, `startsAt`, `endsAt`, capacity, optional `latitude`/`longitude`, cover image/public ID, status, `wasPublished`, participants, favorites, and certificate grants. |

Usernames are unique within each role. The same username can have separate Admin, Organizer, and Volunteer accounts. Sign-in selects the matching username and role, then checks that account's password.

Each participant contains `volunteerId`, `status` (`Registered` or `Cancelled`), and `attendance` (`Unmarked`, `Attended`, or `Absent`). Cancellation keeps the history; rejoining uses the same participant entry. `registeredCount` and `availablePlaces` are calculated from active participants rather than saved counters.

Favorites and certificates contain User IDs. Certificates are granted only to attendees of completed campaigns. A PDF is generated when requested, using the current volunteer, campaign, organization, and activity date. There is no separate certificate model or stored PDF file.

Country is `BH`. Governorates are Capital, Northern, Southern, and Muharraq; Riffa belongs in the area field. Dates are stored in UTC, while inputs and displayed times use Bahrain time (`Asia/Bahrain`, UTC+3).

### Workflow

1. An organizer creates an organization, which enters Pending review. Saving changes sends it for review again.
2. Campaigns begin as Draft. An approved organization can submit a campaign for admin review.
3. Admins approve or reject pending campaigns, or remove published content with feedback. Public campaign pages require both an approved campaign and an approved organization.
4. Volunteers join upcoming campaigns with available places, cancel before the start, and save favorites.
5. Editing an approved campaign before its start returns it to Pending without removing participants. `wasPublished` stays true. Only never-published campaigns without participant history can be deleted; published campaigns can be cancelled.
6. After an approved activity ends, the organizer records attendance and completes it once all active participants are marked. The organizer can then grant certificates to attendees. Attendance is locked while a certificate is granted.
7. Volunteers keep their participation history even when a campaign becomes unavailable publicly. Unavailable favorites can still be removed.

## 3. Application pages

| Audience           | Routes                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public             | `/`, `/campaigns`, `/campaigns/:id`, `/organizations`, `/organizations/:id`, `/organizations/:orgId/campaigns`, `/sign-up`, `/sign-in`                                |
| Signed-in accounts | `/profile`                                                                                                                                                            |
| Volunteers         | `/my/registrations`, `/my/favorites`, `/my/certificates`                                                                                                              |
| Organizers         | `/organizer`, `/organizer/organization`, `/organizer/campaigns`, `/organizer/campaigns/new`, `/organizer/campaigns/:id/edit`, `/organizer/campaigns/:id/participants` |
| Admins             | `/admin`                                                                                                                                                              |

Discovery uses simple React state and array filtering for activity/organization search, governorate, area, category, and an inclusive activity-start date range. Results show six campaigns per page. Search and Clear filters remain visible; Show filters / Hide filters toggles governorate, area, category, and date inputs without clearing selections. Changing or clearing filters resets pagination. The website uses plain forms with styling limited to certificates, maps, and language direction.

## 4. Routes

All paths below are relative to the backend URL. Protected requests use the existing `Authorization: Bearer <token>` header. JSON errors use `{ "error": "message" }`.

### Accounts and organizations

| Method    | Path                        | Purpose                                                                    |
| --------- | --------------------------- | -------------------------------------------------------------------------- |
| POST      | `/auth/sign-up`             | Create a Volunteer or Organizer account; return user and token.            |
| POST      | `/auth/sign-in`             | Sign in with username, password, and selected role; return user and token. |
| GET / PUT | `/auth/me`                  | Read the current account or update name/city.                              |
| GET       | `/organizations`            | List approved organizations.                                               |
| GET       | `/organizations/mine`       | Read the organizer's organization, or `null` before setup.                 |
| GET       | `/organizations/review`     | Admin organization review list.                                            |
| GET       | `/organizations/:id`        | Read an approved organization.                                             |
| POST      | `/organizations`            | Create an organization.                                                    |
| PUT       | `/organizations/:id`        | Save organization changes and return to Pending.                           |
| PUT       | `/organizations/:id/review` | Admin decision with `status` and `reviewReason`.                           |
| DELETE    | `/organizations/:id`        | Delete the owned organization only when it has no campaigns.               |

### Campaigns

| Method             | Path                                         | Purpose                                                                         |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------- |
| GET / POST         | `/campaigns`                                 | Public approved list / create an organizer draft.                               |
| GET                | `/campaigns/mine`, `/campaigns/mine/:id`     | Organizer list and private campaign detail.                                     |
| GET                | `/campaigns/review`, `/campaigns/review/:id` | Admin list and private campaign detail.                                         |
| GET                | `/campaigns/activities`                      | Current volunteer's participation history.                                      |
| GET                | `/campaigns/favorites`                       | Current volunteer's favorites; hidden campaigns return an unavailable entry.    |
| GET                | `/campaigns/certificates`                    | Current volunteer's granted certificates.                                       |
| GET / PUT / DELETE | `/campaigns/:id`                             | Public detail / owner edit / delete an unused unpublished campaign.             |
| POST               | `/campaigns/:id/submit`                      | Submit a draft or rejected campaign for review.                                 |
| POST               | `/campaigns/:id/cancel`                      | Cancel a published campaign.                                                    |
| POST               | `/campaigns/:id/complete`                    | Complete an ended campaign with attendance recorded.                            |
| PUT                | `/campaigns/:id/review`                      | Admin decision with `status` and `reviewReason`.                                |
| GET / POST         | `/campaigns/:id/participants`                | Organizer participants / volunteer joining.                                     |
| DELETE             | `/campaigns/:id/participants/me`             | Cancel the current volunteer's registration.                                    |
| PUT                | `/campaigns/:id/participants/:volunteerId`   | Update `attendance`.                                                            |
| PUT / DELETE       | `/campaigns/:id/favorite`                    | Save / remove a favorite.                                                       |
| PUT / DELETE       | `/campaigns/:id/certificates/:volunteerId`   | Grant / remove a certificate.                                                   |
| GET                | `/campaigns/:id/certificate`                 | Generate the current volunteer's granted PDF certificate.                       |
| POST               | `/uploads`                                   | Organizer image upload as multipart field `image`; returns `{ url, publicId }`. |

## 5. Component hierarchy

`App` provides routes under `UserContext` and `LanguageContext`, with the shared `NavBar`. Each page loads its own data through named service functions.

- Discovery: `ExplorePage` → `CampaignGrid` → `CampaignCard`.
- Public details: `CampaignDetail` and `OrganizationDetail` use `OrganizationContacts`.
- Organizer: `OrganizationProfile` → `OrganizationForm` / `OrganizationView`; `CampaignManager`, `CampaignForm`, and `CampaignParticipants` handle campaign work.
- Volunteer: `VolunteerDashboard`, `Favorites`, and `Certificates` show personal records.
- Admin: `AdminDashboard` switches between `OrganizationReview` and `CampaignReview`.
- Shared: `ImagePicker` previews images; `MapPicker` selects optional coordinates; `LocationMap` shows saved locations and directions. Date utilities handle Bahrain input/display conversion.

## Local setup and deployment

### Backend

1. In `TatawwuBackend`, install dependencies with `npm install`.
2. Create `.env` using `.env.example` and set `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. Use `npm run dev` locally, or `npm start` on the deployment host. The server listens on `PORT`, defaulting to `3000`.

This version targets fresh development data. It does not migrate, reset, or delete an existing database. Signup creates Volunteer or Organizer accounts. To provision an admin, create an account and set its `role` to `Admin` in your own MongoDB administration tool, then sign in again with Admin selected. To use Volunteer with the same username as well, create a separate Volunteer account; changing a role does not create another account.

The User model defines a unique compound index on `username` and `role`. Fresh databases need no index changes. For an existing database, confirm the `username_1_role_1` index exists, then remove only the old unique `username_1` index, if present: `db.users.dropIndex("username_1")`. This permits the same username across roles without removing account records.

### Frontend

1. In `tatawuu-frontend`, install dependencies with `npm install`.
2. Create `.env` using `.env.example`. Set `VITE_BACK_END_SERVER_URL` to the backend origin without a trailing slash, for example `http://localhost:3000`.
3. Use `npm run dev` for local development.
4. For deployment, set `VITE_BACK_END_SERVER_URL` to the deployed HTTPS backend URL before the frontend build. Use `npm run build`, with `dist` as the output directory. The existing `vercel.json` rewrite supports direct links to React pages.

**Live deployment:** the frontend is deployed on Vercel at [https://tatawuu-frontend.vercel.app/](https://tatawuu-frontend.vercel.app/), and the backend is deployed on Render at [https://tatawwubackend.onrender.com](https://tatawwubackend.onrender.com).

### Images and certificates

Cloudinary credentials belong in the backend environment. Images pass through Multer memory storage to Cloudinary; no server uploads folder is used. The database stores the HTTPS URL and public ID. Replacing/removing an image updates the record before deleting the old Cloudinary asset. A failed upload or save leaves the previously saved image intact.

PDFKit streams an A4 landscape certificate directly to the HTTP response. The template has a white background, Bahrain-red border and flag accents, and the official Bahrain coat of arms. Certificate labels remain English in both website languages; volunteer, campaign, and organization names remain as entered. The coat of arms, Arabic font, and source/license notices are bundled with the backend for deployment. The frontend previews/downloads the received PDF using a temporary browser blob URL and releases it afterward, with a matching HTML preview for browsers without a PDF viewer. PDFs do not depend on persistent server storage.

Cloudinary account configuration and deployment environment values must be supplied before deploying. No deployment is performed by the code changes.

### Language and location

The navbar switches between English and العربية. The browser remembers the language; English is the default. Arabic changes the interface to right-to-left across public pages and all dashboards. User-written names, descriptions, and review feedback are not automatically translated. API roles, categories, governorates, and statuses keep their English values. Display dates use the selected language with the Gregorian calendar and Bahrain time; stored dates and date-filter comparisons stay unchanged.

Campaign and organization forms include an optional Leaflet map picker. Click the map, drag the pin, or pan with the keyboard and choose Use map center. Remove pin clears the selected coordinates. Campaigns can explicitly copy the organization's location, and subsequent changes remain independent. The written address is still required. Public and private details show a saved pin and Get directions; records without coordinates use the written address in Google Maps.

Existing organization and campaign create/update/read endpoints accept and return optional numeric `latitude` and `longitude`. Supply both numbers together, omit both on update to preserve them, or send both as `null` to remove them. Existing records need no migration. There is no geocoding service, location permission prompt, or Google API key requirement.

The shared WhatsApp contact link shows the phone number and redirect icon. Eight-digit Bahrain numbers receive the `973` prefix for the link; international numbers retain their country code.

Maps use Leaflet 1.9.4 with OpenStreetMap tiles and visible attribution. Frontend `.env.example` documents optional `VITE_MAP_TILE_URL` and `VITE_MAP_ATTRIBUTION` overrides; change both together for a different tile provider. For deployment, follow the [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/): retain attribution and browser referrers, respect normal HTTP caching, and do not prefetch tiles or offer offline tile downloads. The public tile service has no availability guarantee; select a suitable provider if traffic grows. A map failure does not prevent saving the form's written address.

### Mock development data

The configured development database contains 12 demo accounts, 7 demo organizations, and 18 demo campaigns added on 16 September 2026. Existing records were preserved. This data is fictional and is not added automatically at server startup.

Use username **`demo_tatawwu`** and password **`TatawwuDemo2026!`**, then choose **Admin**, **Organizer**, or **Volunteer** on the sign-in form. These are three separate accounts sharing a username and demo password.

Other organizer usernames are `demo_muharraq`, `demo_southern`, `demo_northern`, `demo_pending`, `demo_rejected`, and `demo_removed`. Other volunteer usernames are `demo_omar`, `demo_noor`, and `demo_ali`. All use the same demo password above.

The examples cover all four governorates, organization review statuses, campaign lifecycle statuses, upcoming and past activities, a full campaign, cancelled registrations, favorites, attendance, and a granted certificate. Upcoming dates run from 18 September to 3 October 2026. The main organizer owns the attendance and certificate examples; the main volunteer has participation history and a certificate to preview/download.

Demo images use Cloudinary's public sample URL with empty public IDs. They demonstrate image display without requiring an upload or deleting the shared sample asset. Configure your own Cloudinary environment values to upload new images.

### Implementation review

Initial implementation verification completed on 16 September 2026:

- Frontend: 46 automated tests passed; lint and the production build passed. Browser checks covered real role sign-in, discovery filters/pagination, participation, favorites, certificates, organizer participants, and admin review.
- Backend: 157 live API requests passed 306 assertions across nine workflow sections. Eight additional mocked Cloudinary assertions and syntax checks for all 16 backend JavaScript files passed.
- Fixes included role-based login redirects, preserving campaign images during text edits, handling image cleanup errors after successful saves, preventing simultaneous joins from overfilling a campaign, and showing missing organizations in admin review without crashing.
- Temporary test files, temporary testing dependencies, and temporary database fixtures were removed after verification. Demo data remains. No Git commands were used.

The Arabic/maps/certificate follow-up was also verified on 16 September 2026:

- 31 frontend tests passed, including language persistence/RTL, all role sign-ins, English API enum values, filter collapse/pagination, WhatsApp links, map coordinates and tile-error recovery, and English certificate controls. Frontend lint and production build passed.
- 48 backend API/helper checks passed for coordinate pairs, omitted values, clearing, older records, certificate eligibility/grants/revocation, and actual PDF responses. Tests used an isolated synthetic database; the configured application data was preserved.
- Certificate renders were visually checked with English, Arabic, mixed-script, long, unbroken, and empty fields. Browser checks covered real Arabic pages, pin selection/dragging/removal, saved language, directions links, and the certificate preview.
- All temporary test scripts, test dependencies, fixtures, and PDF inspection files were removed afterward. Packaged certificate artwork and fonts remain as application assets.

Live Cloudinary upload success was not verified because credentials are not configured. Mocked provider success/failure and the actual multipart missing-configuration response were checked. PDF responses were generated by the real backend; the frontend also shows a styled English certificate preview alongside the PDF for browsers without an embedded PDF viewer.

### Future work

- Volunteer badges and leaderboard.
- Tracked volunteer hours and automatic certificates.
- Admin user-management pages.

## Acknowledgments and Attributions

This project uses the following third-party services, packages, and media:

- **Hosting/Deployment:** frontend deployed on [Vercel](https://vercel.com/) — [https://tatawuu-frontend.vercel.app/](https://tatawuu-frontend.vercel.app/).
- **Image storage:** [Cloudinary](https://cloudinary.com/) for uploading, storing, and delivering organization logos and campaign cover images. See [Cloudinary Node uploads documentation](https://cloudinary.com/documentation/node_image_and_video_upload).
- **Campaign images:** sample/demo campaign images were sourced from Google Images for placeholder and demonstration purposes only; these are used solely for educational, non-commercial project demonstration.
- **Maps:** [Leaflet](https://leafletjs.com/) with [OpenStreetMap](https://www.openstreetmap.org/copyright) tiles for the map picker and saved-location display, per the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
- **PDF generation:** [PDFKit](https://pdfkit.org/) for generating downloadable certificate PDFs.
- **Translation / language switching:** [react-i18next](https://react.i18next.com/) is used to power the English/Arabic language toggle and RTL layout switching across the app.
- **Demo/walkthrough video:** [Watch the project demo on YouTube](https://youtu.be/KCPvImAdC5o?si=pIpgsmEjyxqA5-aN).
- **Bahrain coat of arms artwork:** sourced from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_The_Kingdom_of_Bahrain.svg), bundled with the backend under its source license.

### Technical references

- [MongoDB](https://www.mongodb.com/docs/)
- [Cloudinary Node uploads](https://cloudinary.com/documentation/node_image_and_video_upload)
- [PDFKit](https://pdfkit.org/docs/getting_started.html)
- [Leaflet quick start](https://leafletjs.com/examples/quick-start/)
- [Google Maps directions URLs](https://developers.google.com/maps/documentation/urls/get-started)
- [Bahrain coat of arms source](https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_The_Kingdom_of_Bahrain.svg)
