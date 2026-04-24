--
-- PostgreSQL database dump
--

\restrict PeNB1k5WVOvOkBHxDqZEa3frnk0WsXXftxxVS9GbKsSg1tdNjBry86DR8scUvnG

-- Dumped from database version 17.8 (130b160)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_session_jwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_session_jwt WITH SCHEMA public;


--
-- Name: EXTENSION pg_session_jwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_session_jwt IS 'pg_session_jwt: manage authentication sessions using JWTs';


--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neon_auth
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neon_auth;

--
-- Name: pgrst; Type: SCHEMA; Schema: -; Owner: neon_service
--

CREATE SCHEMA pgrst;


ALTER SCHEMA pgrst OWNER TO neon_service;

--
-- Name: pre_config(); Type: FUNCTION; Schema: pgrst; Owner: neon_service
--

CREATE FUNCTION pgrst.pre_config() RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  SELECT
      set_config('pgrst.db_schemas', 'public', true)
    , set_config('pgrst.db_aggregates_enabled', 'true', true)
    , set_config('pgrst.db_anon_role', 'anonymous', true)
    , set_config('pgrst.jwt_role_claim_key', '.role', true)
$$;


ALTER FUNCTION pgrst.pre_config() OWNER TO neon_service;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.account OWNER TO neon_auth;

--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


ALTER TABLE neon_auth.invitation OWNER TO neon_auth;

--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


ALTER TABLE neon_auth.jwks OWNER TO neon_auth;

--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.member OWNER TO neon_auth;

--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


ALTER TABLE neon_auth.organization OWNER TO neon_auth;

--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


ALTER TABLE neon_auth.project_config OWNER TO neon_auth;

--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


ALTER TABLE neon_auth.session OWNER TO neon_auth;

--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


ALTER TABLE neon_auth."user" OWNER TO neon_auth;

--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE neon_auth.verification OWNER TO neon_auth;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO neondb_owner;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO neondb_owner;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    url text,
    price double precision,
    status text DEFAULT 'draft'::text NOT NULL,
    tags text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" integer
);


ALTER TABLE public."Product" OWNER TO neondb_owner;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductImage" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "categoryId" integer,
    url text NOT NULL,
    key text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO neondb_owner;

--
-- Name: ProductImage_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."ProductImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductImage_id_seq" OWNER TO neondb_owner;

--
-- Name: ProductImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."ProductImage_id_seq" OWNED BY public."ProductImage".id;


--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_id_seq" OWNER TO neondb_owner;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: ProductImage id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage" ALTER COLUMN id SET DEFAULT nextval('public."ProductImage_id_seq"'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
dff409e0-18d3-429e-b376-6055a1eb01bf	buysupply.me	ep-bold-cherry-anj6wmr7	2026-04-20 07:44:20.29+00	2026-04-20 07:44:20.29+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"organization": {"config": {"creatorRole": "owner", "membershipLimit": 100, "organizationLimit": 10, "sendInvitationEmail": false}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Category" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
1	Photocopiers	photocopiers	2026-04-20 10:42:31.9	2026-04-20 10:42:31.9
2	Consumables	consumables	2026-04-20 10:42:33.436	2026-04-20 10:42:33.436
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Product" (id, name, description, url, price, status, tags, "createdAt", "updatedAt", "categoryId") FROM stdin;
59	Canon imageRUNNER ADVANCE DX C259i A4 Colour Photocopier – Wireless Printer Scanner | Only 6000 copies	Canon imageRUNNER ADVANCE DX C259i A4 Colour Multifunction Photocopier\n\nThe Canon imageRUNNER ADVANCE DX C259i is a compact, high-performance A4 colour multifunction photocopier designed for modern offices that demand reliability, speed, and seamless workflow integration. Built with advanced Canon technology, this device delivers professional-quality printing, fast scanning, and secure document handling in one efficient system.\n\n\n🚀 Performance & Productivity\n\nDelivering up to 25 pages per minute in both colour and mono, the C259i is ideal for busy office environments. Fast warm-up times and responsive processing ensure minimal waiting and maximum productivity throughout the day.  \n\nWith high-speed duplex scanning of up to 190 images per minute, large document batches can be digitised quickly and efficiently.  \n\n\n🖨️ Professional Print Quality\n\nProduce sharp, vibrant documents with a print resolution of up to 1200 x 1200 dpi equivalent, ensuring crisp text and high-quality graphics for business-critical output.  \n\nSupports a wide range of media types including plain paper, heavy stock, labels, envelopes, and more — making it a versatile solution for all office printing needs.  \n\n\n📄 All-in-One Office Solution\n\nThis powerful multifunction device combines:\n\nPrinting\nCopying\nScanning\nDocument sending & storage\nOptional fax capability  \nWith automatic duplex printing and a single-pass document feeder, it streamlines everyday tasks and reduces manual handling.\n\n\n📱 Smart Connectivity & Mobile Printing\n\nStay connected with flexible print and scan options including:\n\nWireless printing (optional WiFi)\nApple AirPrint & Mopria support\nCloud and mobile device integration  \nPerfect for modern workplaces where staff need to print or scan directly from smartphones, tablets, or remote locations.\n\n\n🧠 Intelligent User Experience\n\nThe large 10.1-inch colour touchscreen provides an intuitive, smartphone-style interface, making it easy for users to navigate features and customise workflows.  \n\nAdvanced scanning features such as automatic blank page removal and searchable file creation help improve efficiency and reduce admin time.  \n\n\n🔐 Advanced Security Built In\n\nDesigned with business security in mind, the C259i includes:\n\nData encryption and secure document handling\nUser authentication and access control\nSystem verification and protection against threats  \nHelping safeguard sensitive information across your organisation.\n\n\n📦 Paper Handling & Capacity\n\nStandard capacity: 650 sheets\nMaximum capacity: up to 2,300 sheets\nAutomatic document feeder: 100 sheets  \nHandles a wide range of paper sizes from A6 to A4 and supports heavier media for more specialised jobs.\n\n\n⚙️ Built for Reliability\n\nWith a robust design, 3.5GB RAM and 256GB storage, the C259i is built to handle demanding workloads while maintaining consistent performance.  \n\nCompact dimensions make it suitable for offices where space is limited without compromising on capability.\n\n\n💼 Ideal For:\n\nOffices needing a reliable A4 colour copier\nBusinesses upgrading from older machines\nWorkplaces requiring mobile/cloud printing\nCompanies looking for secure document workflows\n\n🔑 Key Features Summary\n\nA4 colour multifunction photocopier\n25 pages per minute print speed\nWireless & mobile printing capability\nHigh-speed duplex scanning\nLarge 10.1” touchscreen interface\nAdvanced security features\nExpandable paper capacity up to 2,300 sheets\n\n\n✅ Why Buy From BuySupply?\n\nAt BuySupply, we don’t just sell machines — we supply reliable office equipment that businesses can depend on.\n\nWith over 30 years of industry experience, we specialise in sourcing, testing, and delivering high-quality photocopiers, printers, and genuine consumables across the UK and worldwide.\n\n\n🔧 Fully Tested & Workshop Prepared\n\nEvery machine is professionally checked in our workshop by experienced technicians.\nWe ensure all devices are clean, configured, and ready for immediate use.\n\n\n📉 Low Meter, High Value\n\nWe focus on low usage machines — giving you premium equipment at a fraction of the cost of new.\n\n\n🚚 UK Delivery & Export Available\n\nWe deliver across the UK and can also ship worldwide including Africa, UAE, India, and Pakistan.\nSecure handling and logistics come as standard.\n\n\n🏢 Trusted by Businesses & Dealers\n\nWe work with:\n\nBusinesses upgrading their office equipment\nPhotocopier dealers\nExport clients\nEnd-of-lease equipment suppliers\n\n🔄 We Buy Your Old Equipment\n\nUpgrading? We also buy used photocopiers, printers, parts, and excess toner stock.\n\n\n💬 Straightforward, No-Nonsense Service\n\nNo pushy sales — just honest advice, fair pricing, and reliable support.\n\n\n🇬🇧 UK-Based Stock – Ready to Go\n\nAll machines are held in the UK and are available for fast dispatch or collection.\n\n\n⭐ Buy With Confidence\n\nWhen you buy from BuySupply, you’re dealing with an experienced supplier who understands the industry — and delivers exactly what your business needs.\n\n\n👉 Call now or message us for best price – trade deals available\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nCanon C259i, Canon imageRUNNER ADVANCE DX C259i, Canon C259i photocopier, Canon C259i printer, Canon C259i scanner, Canon A4 colour photocopier, Canon multifunction printer, Canon MFP copier, Canon office printer, Canon DX C259i for sale, buy Canon C259i, Canon C259i for sale UK, used Canon photocopier, refurbished Canon copier, Canon office printer for sale, A4 colour copier for office, office printer scanner copier, business photocopier UK, Canon copier deals, cheap Canon photocopier UK, wireless printer scanner copier, mobile printing copier, AirPrint office printer, duplex scanning photocopier, 25ppm office printer, colour laser photocopier, compact office copier, small office printer, touchscreen photocopier, secure office printer, cloud printing copier, low meter photocopier, only 1100 copies, nearly new copier, refurbished office printer UK, business grade photocopier, professional office printer, office printer bargain, ex lease photocopier, dealer stock copier, Canon photocopier Burnham, photocopiers Slough, Canon copier Slough, office printers Slough Trading Estate, photocopier supplier Burnham Slough, copier sales Windsor, photocopiers Maidenhead, London photocopier supplier, West London printers, UK photocopier supplier\n	https://www.canon.co.uk/business/products/office-printers/multifunction/colour/imagerunner-advance-dx-c259-c359-series/specifications/imagerunner-advance-dx-259i.html	895	active	Canon C259i, Canon imageRUNNER ADVANCE DX C259i, Canon C259i photocopier, Canon C259i printer, Canon C259i scanner, Canon A4 colour photocopier, Canon multifunction printer, Canon MFP copier, Canon office printer, Canon DX C259i for sale, buy Canon C259i, Canon C259i for sale UK, used Canon photocopier, refurbished Canon copier, Canon office printer for sale, A4 colour copier for office, office printer scanner copier, business photocopier UK, Canon copier deals, cheap Canon photocopier UK, wireless printer scanner copier, mobile printing copier, AirPrint office printer, duplex scanning photocopier, 25ppm office printer, colour laser photocopier, compact office copier, small office printer, touchscreen photocopier, secure office printer, cloud printing copier, low meter photocopier, only 1100 copies, nearly new copier, refurbished office printer UK, business grade photocopier, professional office printer, office printer bargain, ex lease photocopier, dealer stock copier, Canon photocopier Burnham, photocopiers Slough, Canon copier Slough, office printers Slough Trading Estate, photocopier supplier Burnham Slough, copier sales Windsor, photocopiers Maidenhead, London photocopier supplier, West London printers, UK photocopier supplier	2026-04-21 08:10:42.206	2026-04-21 08:19:26.103	1
58	Canon imageRUNNER ADVANCE DX C259i A4 Colour Photocopier – Wireless Printer Scanner | Only 1,100 Copies	Canon imageRUNNER ADVANCE DX C259i A4 Colour Multifunction Photocopier\n\nThe Canon imageRUNNER ADVANCE DX C259i is a compact, high-performance A4 colour multifunction photocopier designed for modern offices that demand reliability, speed, and seamless workflow integration. Built with advanced Canon technology, this device delivers professional-quality printing, fast scanning, and secure document handling in one efficient system.\n\n\n🚀 Performance & Productivity\n\nDelivering up to 25 pages per minute in both colour and mono, the C259i is ideal for busy office environments. Fast warm-up times and responsive processing ensure minimal waiting and maximum productivity throughout the day.  \n\nWith high-speed duplex scanning of up to 190 images per minute, large document batches can be digitised quickly and efficiently.  \n\n\n🖨️ Professional Print Quality\n\nProduce sharp, vibrant documents with a print resolution of up to 1200 x 1200 dpi equivalent, ensuring crisp text and high-quality graphics for business-critical output.  \n\nSupports a wide range of media types including plain paper, heavy stock, labels, envelopes, and more — making it a versatile solution for all office printing needs.  \n\n\n📄 All-in-One Office Solution\n\nThis powerful multifunction device combines:\n\nPrinting\nCopying\nScanning\nDocument sending & storage\nOptional fax capability  \nWith automatic duplex printing and a single-pass document feeder, it streamlines everyday tasks and reduces manual handling.\n\n\n📱 Smart Connectivity & Mobile Printing\n\nStay connected with flexible print and scan options including:\n\nWireless printing (optional WiFi)\nApple AirPrint & Mopria support\nCloud and mobile device integration  \nPerfect for modern workplaces where staff need to print or scan directly from smartphones, tablets, or remote locations.\n\n\n🧠 Intelligent User Experience\n\nThe large 10.1-inch colour touchscreen provides an intuitive, smartphone-style interface, making it easy for users to navigate features and customise workflows.  \n\nAdvanced scanning features such as automatic blank page removal and searchable file creation help improve efficiency and reduce admin time.  \n\n\n🔐 Advanced Security Built In\n\nDesigned with business security in mind, the C259i includes:\n\nData encryption and secure document handling\nUser authentication and access control\nSystem verification and protection against threats  \nHelping safeguard sensitive information across your organisation.\n\n\n📦 Paper Handling & Capacity\n\nStandard capacity: 650 sheets\nMaximum capacity: up to 2,300 sheets\nAutomatic document feeder: 100 sheets  \nHandles a wide range of paper sizes from A6 to A4 and supports heavier media for more specialised jobs.\n\n\n⚙️ Built for Reliability\n\nWith a robust design, 3.5GB RAM and 256GB storage, the C259i is built to handle demanding workloads while maintaining consistent performance.  \n\nCompact dimensions make it suitable for offices where space is limited without compromising on capability.\n\n\n💼 Ideal For:\n\nOffices needing a reliable A4 colour copier\nBusinesses upgrading from older machines\nWorkplaces requiring mobile/cloud printing\nCompanies looking for secure document workflows\n\n🔑 Key Features Summary\n\nA4 colour multifunction photocopier\n25 pages per minute print speed\nWireless & mobile printing capability\nHigh-speed duplex scanning\nLarge 10.1” touchscreen interface\nAdvanced security features\nExpandable paper capacity up to 2,300 sheets\n\n\n✅ Why Buy From BuySupply?\n\nAt BuySupply, we don’t just sell machines — we supply reliable office equipment that businesses can depend on.\n\nWith over 30 years of industry experience, we specialise in sourcing, testing, and delivering high-quality photocopiers, printers, and genuine consumables across the UK and worldwide.\n\n\n🔧 Fully Tested & Workshop Prepared\n\nEvery machine is professionally checked in our workshop by experienced technicians.\nWe ensure all devices are clean, configured, and ready for immediate use.\n\n\n📉 Low Meter, High Value\n\nWe focus on low usage machines — giving you premium equipment at a fraction of the cost of new.\n\n\n🚚 UK Delivery & Export Available\n\nWe deliver across the UK and can also ship worldwide including Africa, UAE, India, and Pakistan.\nSecure handling and logistics come as standard.\n\n\n🏢 Trusted by Businesses & Dealers\n\nWe work with:\n\nBusinesses upgrading their office equipment\nPhotocopier dealers\nExport clients\nEnd-of-lease equipment suppliers\n\n🔄 We Buy Your Old Equipment\n\nUpgrading? We also buy used photocopiers, printers, parts, and excess toner stock.\n\n\n💬 Straightforward, No-Nonsense Service\n\nNo pushy sales — just honest advice, fair pricing, and reliable support.\n\n\n🇬🇧 UK-Based Stock – Ready to Go\n\nAll machines are held in the UK and are available for fast dispatch or collection.\n\n\n⭐ Buy With Confidence\n\nWhen you buy from BuySupply, you’re dealing with an experienced supplier who understands the industry — and delivers exactly what your business needs.\n\n\n\n\n👉 Call now or message us for best price – trade deals available\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nCanon C259i, Canon imageRUNNER ADVANCE DX C259i, Canon C259i photocopier, Canon C259i printer, Canon C259i scanner, Canon A4 colour photocopier, Canon multifunction printer, Canon MFP copier, Canon office printer, Canon DX C259i for sale, buy Canon C259i, Canon C259i for sale UK, used Canon photocopier, refurbished Canon copier, Canon office printer for sale, A4 colour copier for office, office printer scanner copier, business photocopier UK, Canon copier deals, cheap Canon photocopier UK, wireless printer scanner copier, mobile printing copier, AirPrint office printer, duplex scanning photocopier, 25ppm office printer, colour laser photocopier, compact office copier, small office printer, touchscreen photocopier, secure office printer, cloud printing copier, low meter photocopier, only 1100 copies, nearly new copier, refurbished office printer UK, business grade photocopier, professional office printer, office printer bargain, ex lease photocopier, dealer stock copier, Canon photocopier Burnham, photocopiers Slough, Canon copier Slough, office printers Slough Trading Estate, photocopier supplier Burnham Slough, copier sales Windsor, photocopiers Maidenhead, London photocopier supplier, West London printers, UK photocopier supplier\n\n	https://www.canon.co.uk/business/products/office-printers/multifunction/colour/imagerunner-advance-dx-c259-c359-series/specifications/imagerunner-advance-dx-259i.html	995	active	Canon C259i, Canon imageRUNNER ADVANCE DX C259i, Canon C259i photocopier, Canon C259i printer, Canon C259i scanner, Canon A4 colour photocopier, Canon multifunction printer, Canon MFP copier, Canon office printer, Canon DX C259i for sale, buy Canon C259i, Canon C259i for sale UK, used Canon photocopier, refurbished Canon copier, Canon office printer for sale, A4 colour copier for office, office printer scanner copier, business photocopier UK, Canon copier deals, cheap Canon photocopier UK, wireless printer scanner copier, mobile printing copier, AirPrint office printer, duplex scanning photocopier, 25ppm office printer, colour laser photocopier, compact office copier, small office printer, touchscreen photocopier, secure office printer, cloud printing copier, low meter photocopier, only 1100 copies, nearly new copier, refurbished office printer UK, business grade photocopier, professional office printer, office printer bargain, ex lease photocopier, dealer stock copier, Canon photocopier Burnham, photocopiers Slough, Canon copier Slough, office printers Slough Trading Estate, photocopier supplier Burnham Slough, copier sales Windsor, photocopiers Maidenhead, London photocopier supplier, West London printers, UK photocopier supplier	2026-04-21 07:57:14.446	2026-04-21 14:43:47.186	1
63	Canon  C5840i A3 Colour Copier Printer Scanner | Low Meter | Refurbished UK	Canon C5840i A3 Colour Copier Printer Scanner | Low Meter | Refurbished UK\n\n\n\nPowerful, reliable, and built for busy offices, the Canon C5840i delivers fast, high-quality colour printing without unnecessary extras.\n\n\n\nThis standard configuration is ideal for businesses that need a dependable, cost-effective A3 multifunction device for everyday office use.\n\n\n\nKey Highlights\nA3 Colour Print / Copy / Scan\nUp to 40 pages per minute\nStandard office configuration (no finisher or paper deck)\nLarge touchscreen display\nNetwork and mobile printing ready\nFully tested and prepared\n\n\n\nCondition\nRefurbished and in excellent working order\nLow meter reading\nCleaned, checked, and ready to go\n\n\n\nPerfect For\nOffices, schools, small businesses, warehouses, and any environment needing a reliable photocopier without additional finishing features\n\n\n\nWhy Buy From BuySupply\nTrusted UK supplier\nQuality checked machines\nDelivery and setup available\nOngoing support and consumables\n\nMessage us today for pricing, availability, or rental options. Fast UK delivery available\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nCanon C5840i, Canon imageRUNNER ADVANCE DX C5840i, A3 colour photocopier, office copier UK, refurbished Canon printer, business printer scanner copier, photocopiers Slough, buy photocopier UK\n	https://www.canon.co.uk/business/products/office-printers/multifunction/colour/imagerunner-advance-dx-c5800-series/specifications/	1895	active	Canon C5840i, Canon imageRUNNER ADVANCE DX C5840i, Canon C5800 series, Canon C5840i for sale UK, Canon imageRUNNER ADVANCE DX C5840i price, A3 colour photocopier, A3 colour printer scanner copier, multifunction printer UK, office photocopier, business printer copier scanner, high volume office printer, refurbished Canon copier, used Canon photocopier, Canon copier for sale UK, photocopier with finisher, copier with paper deck, stapling finisher copier, office photocopier with finisher and paper deck, high capacity office printer, fast colour copier 40ppm, business printer 40ppm Canon, high volume colour printer copier scanner, office printing solution, commercial printer UK, copier machine for office use UK, Canon multifunction printer A3 colour, photocopier for schools offices UK, copier with stapler finisher UK, high capacity office printer UK, network printer copier, network office printer Canon UK, mobile printing AirPrint Canon, wireless printing ready, duplex printing copier, high speed document scanner, professional office copier, buy photocopier UK, buy photocopier online UK, photocopier dealers UK, commercial photocopier supplier UK, refurbished office printers UK, copier machine UK, cheap office copier UK, office printer UK, business printer, Canon MFD, photocopier for sale, used copier UK, high speed copier, 40ppm printer, BuySupply copier, photocopiers Slough, buy photocopier Burnham, office printers Slough Trading Estate, photocopiers Windsor, photocopiers Maidenhead, photocopiers Berkshire Buckinghamshire, office printers West London, photocopiers London, copier supplier near me UK, business printers Slough, printer copier rental Slough, copier sales Burnham Slough, office photocopiers London UK, local copier supplier UK, buy printer Slough Windsor Maidenhead, BuySupply copiers printers toners inks, refurbished office equipment UK	2026-04-21 09:32:46.56	2026-04-21 09:46:47.598	1
68	Canon imageRUNNER ADVANCE C5550i A3 Colour Photocopier | Printer Scanner | Office MFP UK	The Canon imageRUNNER ADVANCE C5550i is a powerful, high-volume A3 colour multifunction photocopier designed for busy office environments that demand speed, reliability, and professional print quality.\n\n\n\nIdeal for businesses in Burnham, Slough, Windsor, Maidenhead and across London, this machine delivers fast, consistent performance with advanced workflow features and mobile connectivity.\n\n\n\nKey Features\n\n\n\n50 pages per minute print and copy speed (A4)\nA3 and A4 colour multifunction (Print / Copy / Scan)\nLarge responsive touchscreen control panel\nMobile printing (AirPrint, Google Cloud Print, Canon PRINT Business)\nAdvanced scan to email, network and USB functionality\nHigh-capacity paper handling for busy environments\nSecure printing and user authentication options\nDesigned for medium to high volume offices\n\n\n\nWhy Buy from BuySupply\n\n\n\nAt BuySupply, every machine is carefully selected, tested, and prepared to ensure reliability and performance.\n\n\n\nFully tested and workshop prepared by experienced technicians\nSupplied with a unique stock ID and quality check process\nSourced from end-of-lease and upgraded dealer stock\nUK delivery and installation available\nOngoing support, servicing, and consumables supply\n\n\n\nWe specialise in supplying businesses locally in Burnham and Slough, as well as nationwide across the UK.\n\n\n\nIdeal For\n\n\n\nOffices with high print volumes\nBusinesses needing professional colour output\nTeams requiring scan workflows and document management\nCompanies looking for a cost-effective alternative to new machines\n\n\n\nCondition Options\n\n\n\nRefurbished (fully tested and serviced)\nLow meter units available (subject to stock)\nOptional upgrades including additional paper trays, finishers and network setup\n\n\n\nBuy, Rent or Lease\n\n\n\nOutright purchase available\n£0 upfront rental options (NOT A LEASE)\nService contracts based on actual usage with no minimums	https://www.canon.co.uk/business/products/office-printers/multifunction/colour/imagerunner-advance-c5500-ii-series/?utm_source=google&utm_medium=cpc&utm_campaign=gb_dps_wrkspc&utm_content=ao_ziggy_cid-21385500694_kwd=&utm_term=crid-702430193940_tid-dsa-1729525748843&gad_source=1&gad_campaignid=21385500694&gbraid=0AAAAADNS51gRohQQ0EczNPED-D3TywNL8&gclid=EAIaIQobChMIw5_E_Ib_kwMV-ZFQBh3r4zu4EAAYASAAEgLTrPD_BwE#ir-c5550i-ii	1195	active	Canon imageRUNNER ADVANCE C5550i, Canon C5550i, Canon photocopier, Canon printer, Canon scanner, A3 colour copier, office photocopier, multifunction printer, MFP, refurbished copier, used copier UK, copier Burnham, photocopier Slough, copier Windsor, photocopier Maidenhead, London copier supplier, office printer UK, Canon dealer UK, copier rental UK, business printer, colour laser copier, scan to email printer, mobile print copier, Canon AirPrint printer, Canon office machine, copier sales UK, BuySupply copier	2026-04-21 13:30:08.674	2026-04-21 13:47:02.138	1
61	Canon imageRUNNER ADVANCE DX C5860i A3 Colour MFD Copier Printer Scanner | Finisher | Paper Deck | 285k | UK	Canon C5860i A3 Colour Copier | Finisher + Paper Deck | 285k Copies\n\n\n\nPowerful, reliable, and built for busy offices, the Canon C5860i delivers fast, high-quality colour printing with professional finishing.\n\n\n\nThis machine comes fully equipped with a finisher for stapling and sorting, plus an additional paper deck for high-volume printing. Ideal for businesses that need performance without the cost of new equipment.\n\n\n\nKey Highlights\nA3 Colour Print / Copy / Scan\nUp to 60 pages per minute\nFinisher (stapling and sorting)\nExtra paper deck (high capacity)\nLarge touchscreen display\nNetwork and mobile printing ready\nFully tested and prepared\n\n\n\nCondition\nRefurbished and in excellent working order\nMeter reading: 285,000 copies\nCleaned, checked, and ready to go\n\n\n\nPerfect For\nOffices, schools, warehouses, construction sites, and any business needing a fast, reliable photocopier\n\n\n\nWhy Buy From BuySupply\nTrusted UK supplier\nQuality checked machines\nDelivery and setup available\nOngoing support and consumables\n\nMessage us today for pricing, availability, or rental options. Fast UK delivery available\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nCanon C5860i, A3 colour photocopier, office copier UK, refurbished Canon printer, copier with finisher, business printer scanner copier, photocopiers Slough, buy photocopier UKCanon C5860i, Canon imageRUNNER ADVANCE DX C5860i, Canon C5800 series, Canon C5860i for sale UK, Canon imageRUNNER ADVANCE DX C5860i price, A3 colour photocopier, A3 colour printer scanner copier, multifunction printer UK, office photocopier, business printer copier scanner, high volume office printer, refurbished Canon copier, used Canon photocopier, used Canon C5860i low meter, Canon copier for sale UK, photocopier with finisher, copier with paper deck, stapling finisher copier, office photocopier with finisher and paper deck, high capacity office printer, fast colour copier 60ppm, business printer 60ppm Canon, high volume colour printer copier scanner, office printing solution, commercial printer UK, copier machine for office use UK, Canon multifunction printer A3 colour, photocopier for schools offices UK, copier with stapler finisher UK, high capacity office printer UK, network printer copier, network office printer Canon UK, mobile printing AirPrint Canon, wireless printing ready, duplex printing copier, high speed document scanner, professional office copier, buy photocopier UK, buy photocopier online UK, photocopier dealers UK, commercial photocopier supplier UK, refurbished office printers UK, copier machine UK, cheap office copier UK, office printer UK, business printer, Canon MFD, photocopier for sale, used copier UK, high speed copier, 60ppm printer, BuySupply copier, photocopiers Slough, buy photocopier Burnham, office printers Slough Trading Estate, photocopiers Windsor, photocopiers Maidenhead, photocopiers Berkshire Buckinghamshire, office printers West London, photocopiers London, copier supplier near me UK, business printers Slough, printer copier rental Slough, copier sales Burnham Slough, office photocopiers London UK, local copier supplier UK, buy printer Slough Windsor Maidenhead, BuySupply copiers printers toners inks, refurbished office equipment UK\n	https://www.canon.co.uk/business/products/office-printers/multifunction/colour/imagerunner-advance-dx-c5800-series/specifications/	1995	active	Canon C5860i, Canon imageRUNNER ADVANCE DX C5860i, Canon C5800 series, Canon C5860i for sale UK, Canon imageRUNNER ADVANCE DX C5860i price, A3 colour photocopier, A3 colour printer scanner copier, multifunction printer UK, office photocopier, business printer copier scanner, high volume office printer, refurbished Canon copier, used Canon photocopier, used Canon C5860i low meter, Canon copier for sale UK, photocopier with finisher, copier with paper deck, stapling finisher copier, office photocopier with finisher and paper deck, high capacity office printer, fast colour copier 60ppm, business printer 60ppm Canon, high volume colour printer copier scanner, office printing solution, commercial printer UK, copier machine for office use UK, Canon multifunction printer A3 colour, photocopier for schools offices UK, copier with stapler finisher UK, high capacity office printer UK, network printer copier, network office printer Canon UK, mobile printing AirPrint Canon, wireless printing ready, duplex printing copier, high speed document scanner, professional office copier, buy photocopier UK, buy photocopier online UK, photocopier dealers UK, commercial photocopier supplier UK, refurbished office printers UK, copier machine UK, cheap office copier UK, office printer UK, business printer, Canon MFD, photocopier for sale, used copier UK, high speed copier, 60ppm printer, BuySupply copier, photocopiers Slough, buy photocopier Burnham, office printers Slough Trading Estate, photocopiers Windsor, photocopiers Maidenhead, photocopiers Berkshire Buckinghamshire, office printers West London, photocopiers London, copier supplier near me UK, business printers Slough, printer copier rental Slough, copier sales Burnham Slough, office photocopiers London UK, local copier supplier UK, buy printer Slough Windsor Maidenhead, BuySupply copiers printers toners inks, refurbished office equipment UK	2026-04-21 08:57:45.559	2026-04-21 09:29:02.609	1
60	Canon imageRUNNER ADVANCE DX C259i A4 Colour Photocopier – Wireless Printer Scanner | Only 9000 copies	Canon imageRUNNER ADVANCE DX C259i A4 Colour Multifunction Photocopier\n\nThe Canon imageRUNNER ADVANCE DX C259i is a compact, high-performance A4 colour multifunction photocopier designed for modern offices that demand reliability, speed, and seamless workflow integration. Built with advanced Canon technology, this device delivers professional-quality printing, fast scanning, and secure document handling in one efficient system.\n\n\n🚀 Performance & Productivity\n\nDelivering up to 25 pages per minute in both colour and mono, the C259i is ideal for busy office environments. Fast warm-up times and responsive processing ensure minimal waiting and maximum productivity throughout the day.  \n\nWith high-speed duplex scanning of up to 190 images per minute, large document batches can be digitised quickly and efficiently.  \n\n\n🖨️ Professional Print Quality\n\nProduce sharp, vibrant documents with a print resolution of up to 1200 x 1200 dpi equivalent, ensuring crisp text and high-quality graphics for business-critical output.  \n\nSupports a wide range of media types including plain paper, heavy stock, labels, envelopes, and more — making it a versatile solution for all office printing needs.  \n\n\n📄 All-in-One Office Solution\n\nThis powerful multifunction device combines:\n\nPrinting\nCopying\nScanning\nDocument sending & storage\nOptional fax capability  \nWith automatic duplex printing and a single-pass document feeder, it streamlines everyday tasks and reduces manual handling.\n\n\n📱 Smart Connectivity & Mobile Printing\n\nStay connected with flexible print and scan options including:\n\nWireless printing (optional WiFi)\nApple AirPrint & Mopria support\nCloud and mobile device integration  \nPerfect for modern workplaces where staff need to print or scan directly from smartphones, tablets, or remote locations.\n\n\n🧠 Intelligent User Experience\n\nThe large 10.1-inch colour touchscreen provides an intuitive, smartphone-style interface, making it easy for users to navigate features and customise workflows.  \n\nAdvanced scanning features such as automatic blank page removal and searchable file creation help improve efficiency and reduce admin time.  \n\n\n🔐 Advanced Security Built In\n\nDesigned with business security in mind, the C259i includes:\n\nData encryption and secure document handling\nUser authentication and access control\nSystem verification and protection against threats  \nHelping safeguard sensitive information across your organisation.\n\n\n📦 Paper Handling & Capacity\n\nStandard capacity: 650 sheets\nMaximum capacity: up to 2,300 sheets\nAutomatic document feeder: 100 sheets  \nHandles a wide range of paper sizes from A6 to A4 and supports heavier media for more specialised jobs.\n\n\n⚙️ Built for Reliability\n\nWith a robust design, 3.5GB RAM and 256GB storage, the C259i is built to handle demanding workloads while maintaining consistent performance.  \n\nCompact dimensions make it suitable for offices where space is limited without compromising on capability.\n\n\n💼 Ideal For:\n\nOffices needing a reliable A4 colour copier\nBusinesses upgrading from older machines\nWorkplaces requiring mobile/cloud printing\nCompanies looking for secure document workflows\n\n🔑 Key Features Summary\n\nA4 colour multifunction photocopier\n25 pages per minute print speed\nWireless & mobile printing capability\nHigh-speed duplex scanning\nLarge 10.1” touchscreen interface\nAdvanced security features\nExpandable paper capacity up to 2,300 sheets\n\n\n✅ Why Buy From BuySupply?\n\nAt BuySupply, we don’t just sell machines — we supply reliable office equipment that businesses can depend on.\n\nWith over 30 years of industry experience, we specialise in sourcing, testing, and delivering high-quality photocopiers, printers, and genuine consumables across the UK and worldwide.\n\n\n🔧 Fully Tested & Workshop Prepared\n\nEvery machine is professionally checked in our workshop by experienced technicians.\nWe ensure all devices are clean, configured, and ready for immediate use.\n\n\n📉 Low Meter, High Value\n\nWe focus on low usage machines — giving you premium equipment at a fraction of the cost of new.\n\n\n🚚 UK Delivery & Export Available\n\nWe deliver across the UK and can also ship worldwide including Africa, UAE, India, and Pakistan.\nSecure handling and logistics come as standard.\n\n\n🏢 Trusted by Businesses & Dealers\n\nWe work with:\n\nBusinesses upgrading their office equipment\nPhotocopier dealers\nExport clients\nEnd-of-lease equipment suppliers\n\n🔄 We Buy Your Old Equipment\n\nUpgrading? We also buy used photocopiers, printers, parts, and excess toner stock.\n\n\n💬 Straightforward, No-Nonsense Service\n\nNo pushy sales — just honest advice, fair pricing, and reliable support.\n\n\n🇬🇧 UK-Based Stock – Ready to Go\n\nAll machines are held in the UK and are available for fast dispatch or collection.\n\n\n⭐ Buy With Confidence\n\nWhen you buy from BuySupply, you’re dealing with an experienced supplier who understands the industry — and delivers exactly what your business needs.\n\n\n👉 Call now or message us for best price – trade deals available\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nCanon imageRUNNER ADVANCE C5550i, Canon C5550i, Canon photocopier, Canon printer, Canon scanner, A3 colour copier, office photocopier, multifunction printer, MFP, refurbished copier, used copier UK, copier Burnham, photocopier Slough, copier Windsor, photocopier Maidenhead, London copier supplier, office printer UK, Canon dealer UK, copier rental UK, business printer, colour laser copier, scan to email printer, mobile print copier, Canon AirPrint printer, Canon office machine, copier sales UK, BuySupply copier\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n	https://www.canon.co.uk/business/products/office-printers/multifunction/colour/imagerunner-advance-dx-c259-c359-series/specifications/imagerunner-advance-dx-259i.html	895	active	Canon C259i, Canon imageRUNNER ADVANCE DX C259i, Canon C259i photocopier, Canon C259i printer, Canon C259i scanner, Canon A4 colour photocopier, Canon multifunction printer, Canon MFP copier, Canon office printer, Canon DX C259i for sale, buy Canon C259i, Canon C259i for sale UK, used Canon photocopier, refurbished Canon copier, Canon office printer for sale, A4 colour copier for office, office printer scanner copier, business photocopier UK, Canon copier deals, cheap Canon photocopier UK, wireless printer scanner copier, mobile printing copier, AirPrint office printer, duplex scanning photocopier, 25ppm office printer, colour laser photocopier, compact office copier, small office printer, touchscreen photocopier, secure office printer, cloud printing copier, low meter photocopier, only 1100 copies, nearly new copier, refurbished office printer UK, business grade photocopier, professional office printer, office printer bargain, ex lease photocopier, dealer stock copier, Canon photocopier Burnham, photocopiers Slough, Canon copier Slough, office printers Slough Trading Estate, photocopier supplier Burnham Slough, copier sales Windsor, photocopiers Maidenhead, London photocopier supplier, West London printers, UK photocopier supplier	2026-04-21 08:17:06.97	2026-04-21 13:38:53.144	1
69	Konica Minolta bizhub C300i A3 Colour Photocopier | Printer Scanner | Office MFP	The Konica Minolta bizhub C300i is a modern, high-performance A3 colour multifunction photocopier designed for efficient, secure, and connected office environments.\n\nBuilt for reliability and ease of use, this machine combines fast output, advanced scanning capabilities, and a large touchscreen interface, making it ideal for businesses that need consistent performance and professional print quality.\n\nIdeal for businesses in Burnham, Slough, Windsor, Maidenhead and across London, the C300i delivers excellent results with flexible connectivity and workflow automation.\n\n\nKey Features\n\n30 pages per minute print and copy speed (A4) \nA3 and A4 colour multifunction (Print / Copy / Scan)\nLarge 10.1 inch touchscreen control panel with modern interface \nMobile printing support (AirPrint, mobile apps, cloud connectivity) \nAdvanced scan to email, network, USB and cloud\nHigh resolution output up to 1200 x 1200 dpi \nPaper capacity from 1,150 sheets up to 6,650 sheets (expandable) \nSecure printing and user authentication features\nEnergy efficient design for lower running costs\n\n\nWhy Buy from BuySupply\n\nAt BuySupply, every machine is carefully selected, tested, and prepared to ensure reliability and performance.\n\nFully tested and workshop prepared by experienced technicians\nSupplied with a unique stock ID and quality check process\nSourced from end-of-lease and upgraded dealer stock\nUK delivery and installation available\nOngoing support, servicing, and consumables supply\n\nWe specialise in supplying businesses locally in Burnham and Slough, as well as nationwide across the UK.\n\n\nIdeal For\n\nOffices with medium to high print volumes\nBusinesses needing reliable colour output\nTeams requiring advanced scan workflows\nCompanies looking for a modern, user-friendly office copier\n\n\nCondition Options\n\nRefurbished (fully tested and serviced)\nLow meter units available (subject to stock)\nOptional upgrades including additional paper trays, finishers and network setup\n\n\nBuy, Rent or Lease\n\nOutright purchase available\n£0 upfront rental options (NOT A LEASE)\nService contracts based on actual usage with no minimums\n	https://kmbs.konicaminolta.us/products/multifunction/color-multi-function/bizhub-c360i-c300i-c250i/	1195	active	Konica Minolta bizhub C300i, bizhub C300i, Konica Minolta photocopier, Konica printer, Konica scanner, A3 colour copier, office photocopier, multifunction printer, MFP, refurbished copier, used copier UK, copier Burnham, photocopier Slough, copier Windsor, photocopier Maidenhead, London copier supplier, office printer UK, Konica dealer UK, copier rental UK, business printer, colour laser copier, scan to email printer, mobile print copier, AirPrint printer, office machine, copier sales UK, BuySupply copier	2026-04-21 14:11:33.491	2026-04-21 14:12:38.729	1
71	Canon imageRUNNER ADVANCE DX C5735i A3 Colour Photocopier | Printer Scanner | Office MFP	The Canon imageRUNNER ADVANCE DX C5735i is a powerful, next-generation A3 colour multifunction photocopier designed for modern offices that require secure, connected, and high-quality document workflows.\n\nBuilt for reliability and productivity, this machine delivers fast output, advanced scanning, and strong security features, making it ideal for busy office environments and growing businesses.\n\nIdeal for businesses in Burnham, Slough, Windsor, Maidenhead and across London, the C5735i provides professional colour output with cloud-ready functionality and flexible connectivity.\n\n\nKey Features\n\n35 pages per minute print and copy speed (A4) \nA3 and A4 colour multifunction (Print / Copy / Scan / Send / Store) \nLarge 10.1 inch touchscreen control panel \nMobile printing (AirPrint, Mopria, app and cloud connectivity) \nHigh-speed single pass duplex scanning up to approx. 270 images per minute \nPrint resolution up to 1200 x 1200 dpi \nPaper capacity from approx. 1,200 sheets up to 6,350 sheets \nAdvanced security including user authentication and encrypted print \nCloud-ready workflows with uniFLOW compatibility  \n\n\nWhy Buy from BuySupply\n\nAt BuySupply, every machine is carefully selected, tested, and prepared to ensure reliability and performance.\n\nFully tested and workshop prepared by experienced technicians\nSupplied with a unique stock ID and quality check process\nSourced from end-of-lease and upgraded dealer stock\nUK delivery and installation available\nOngoing support, servicing, and consumables supply\n\nWe specialise in supplying businesses locally in Burnham and Slough, as well as nationwide across the UK.\n\n\nIdeal For\n\nOffices with medium to high print volumes\nBusinesses needing secure and reliable document workflows\nTeams requiring fast scanning and cloud integration\nCompanies looking for a modern, efficient office copier\n\n\nCondition Options\n\nRefurbished (fully tested and serviced)\nLow meter units available (subject to stock)\nOptional upgrades including additional paper trays, finishers and network setup\n\n\nBuy, Rent or Lease\n\nOutright purchase available\n£0 upfront rental options (NOT A LEASE)\nService contracts based on actual usage with no minimums	\N	1595	active	Canon imageRUNNER ADVANCE DX C5735i, Canon C5735i, Canon photocopier, Canon printer, Canon scanner, A3 colour copier, office photocopier, multifunction printer, MFP, refurbished copier, used copier UK, copier Burnham, photocopier Slough, copier Windsor, photocopier Maidenhead, London copier supplier, office printer UK, Canon dealer UK, copier rental UK, business printer, colour laser copier, scan to email printer, mobile print copier, Canon AirPrint printer, Canon office machine, copier sales UK, BuySupply copier	2026-04-21 14:21:53.027	2026-04-21 14:21:53.027	1
73	Genuine OEM Ricoh M0B14359 Pressure Roller | Pro C9200 C9210 | Original OEM Fuser Part	Genuine Original OEM Ricoh M0B14359 Pressure Roller | Pro C9200 C9210 | Original OEM Fuser Part\n\nThe Ricoh M0B14359 Pressure Roller is a genuine OEM fuser component designed for high-volume production machines, ensuring consistent print quality and reliable performance.\n\nThis critical part applies pressure within the fuser assembly, bonding toner to paper for sharp, durable prints. Ideal for maintaining peak performance in production print environments.\n\nCompatible with Ricoh Pro C9200 and C9210 series machines, this is an essential replacement part for preventing print defects and maintaining output quality.\n\n\nKey Features\n\nGenuine Ricoh OEM pressure roller\nPart number M0B14359 (also referenced as M0B1-4359) \nDesigned for fuser assembly (toner bonding process) \nHigh durability with approx. 900,000 page lifespan \nEnsures consistent image quality and proper toner adhesion\nDirect replacement for worn or damaged rollers\nSupplied as a single unit\n\n\nCompatibility\n\nRicoh Pro C9200\nRicoh Pro C9210\nAlso compatible with equivalent Savin and Lanier models  \n\n\nWhy This Part Matters\n\nThe pressure roller is a key component in the fusing process. When worn, it can cause:\n\nPoor toner adhesion\nWrinkled or creased paper\nImage defects or uneven print quality\n\nReplacing this part restores print quality and ensures smooth operation in high-volume environments.\n\n\nWhy Buy from BuySupply\n\nFully checked and verified parts\nGenuine OEM and high-quality components\nFast UK dispatch available\nTrusted supplier of copier parts and consumables\nSupporting dealers and businesses nationwide\n\nWe supply parts locally in Burnham, Slough, Windsor and across the UK.\n\n\nIdeal For\n\nPrint rooms and production environments\nDealers servicing Ricoh production machines\nBusinesses maintaining Pro C9200 / C9210 devices\nEngineers requiring reliable OEM replacement parts\n\n\nCondition\n\nGenuine OEM (Original Ricoh)\nBrand new condition\nSecurely packaged for safe delivery  \n\n	\N	185	active	Ricoh M0B14359, M0B1-4359, Ricoh pressure roller, Ricoh fuser roller, Ricoh Pro C9200 parts, Ricoh Pro C9210 parts, Ricoh spare parts, OEM Ricoh parts, copier parts UK, printer parts UK, fuser assembly part, pressure roller, Ricoh engineer parts, copier repair parts, Burnham copier parts, Slough photocopier parts, London copier parts, Ricoh production printer parts, BuySupply parts	2026-04-21 14:34:25.648	2026-04-21 14:34:25.648	2
76	Genuine OEM Ricoh M0B14359 Pressure Roller | Pro C9200 C9210 | Original OEM Fuser Part	Ricoh M0B14359 Pressure Roller | Pro C9200 C9210 | Original OEM Fuser Part\n\nThe Ricoh M0B14359 Pressure Roller is a genuine OEM fuser component designed for high-volume production machines, ensuring consistent print quality and reliable performance.\n\nThis critical part applies pressure within the fuser assembly, bonding toner to paper for sharp, durable prints. Ideal for maintaining peak performance in production print environments.\n\nCompatible with Ricoh Pro C9200 and C9210 series machines, this is an essential replacement part for preventing print defects and maintaining output quality.\n\n\nKey Features\n\nGenuine Ricoh OEM pressure roller\nPart number M0B14359 (also referenced as M0B1-4359) \nDesigned for fuser assembly (toner bonding process) \nHigh durability with approx. 900,000 page lifespan \nEnsures consistent image quality and proper toner adhesion\nDirect replacement for worn or damaged rollers\nSupplied as a single unit\n\n\nCompatibility\n\nRicoh Pro C9200\nRicoh Pro C9210\nAlso compatible with equivalent Savin and Lanier models  \n\n\nWhy This Part Matters\n\nThe pressure roller is a key component in the fusing process. When worn, it can cause:\n\nPoor toner adhesion\nWrinkled or creased paper\nImage defects or uneven print quality\n\nReplacing this part restores print quality and ensures smooth operation in high-volume environments.\n\n\nWhy Buy from BuySupply\n\nFully checked and verified parts\nGenuine OEM and high-quality components\nFast UK dispatch available\nTrusted supplier of copier parts and consumables\nSupporting dealers and businesses nationwide\n\nWe supply parts locally in Burnham, Slough, Windsor and across the UK.\n\n\nIdeal For\n\nPrint rooms and production environments\nDealers servicing Ricoh production machines\nBusinesses maintaining Pro C9200 / C9210 devices\nEngineers requiring reliable OEM replacement parts\n\n\nCondition\n\nGenuine OEM (Original Ricoh)\nBrand new \nSecurely packaged for safe delivery  \n\n	\N	168	active	Ricoh M0B14359, M0B1-4359, Ricoh pressure roller, Ricoh fuser roller, Ricoh Pro C9200 parts, Ricoh Pro C9210 parts, Ricoh spare parts, OEM Ricoh parts, copier parts UK, printer parts UK, fuser assembly part, pressure roller, Ricoh engineer parts, copier repair parts, Burnham copier parts, Slough photocopier parts, London copier parts, Ricoh production printer parts, BuySupply parts	2026-04-21 14:50:52.851	2026-04-21 14:50:52.851	2
81	Ricoh D0CQ6090 Flat Belt Transfer | Pro C5200 C5210 | Original OEM Transfer Belt	The Ricoh D0CQ6090 Flat Belt Transfer is a genuine OEM image transfer belt designed for high-volume production printers, ensuring accurate and consistent transfer of toner onto paper.\n\nThis critical component collects and transfers the full colour image from the drum system onto the paper, making it essential for maintaining sharp, aligned, and professional print output in demanding environments.  \n\nCompatible with Ricoh Pro C5200 and C5210 series, this part is vital for keeping machines running at peak performance and preventing print defects.\n\n\nKey Features\n\nGenuine Ricoh OEM flat belt transfer (IBT transfer belt)\nPart number D0CQ6090 (also referenced as D0CQ-6090, D2616090, D261-6090) \nResponsible for transferring full colour image to paper\nEnsures accurate image alignment and print consistency \nHigh durability for production print environments\nDirect replacement for worn or damaged transfer belts\nSupplied as a single unit\n\n\nCompatibility\n\nRicoh Pro C5200\nRicoh Pro C5210\nAlso compatible with Pro C5200s / C5210s and related models  \n\n\nWhy This Part Matters\n\nThe transfer belt is one of the most important components in the print process. When worn or damaged, it can cause:\n\nColour misalignment\nFaded or incomplete prints\nGhosting or image repetition\nPoor image transfer and quality issues\n\nReplacing this part restores proper image transfer and ensures consistent, high-quality output.\n\n\nWhy Buy from BuySupply\n\nFully checked and verified parts\nGenuine OEM and high-quality components\nFast UK dispatch available\nTrusted supplier of copier parts and consumables\nSupporting dealers and businesses nationwide\n\nWe supply parts locally in Burnham, Slough, Windsor and across the UK.\n\n\nIdeal For\n\nProduction print environments\nDealers servicing Ricoh Pro machines\nBusinesses running C5200 / C5210 series\nEngineers requiring reliable OEM replacement parts\n\n\nCondition\n\nGenuine OEM (Original Ricoh)\nBrand new condition\nSecurely packaged for safe delivery\n\n	\N	165	active	Ricoh D0CQ6090, D0CQ-6090, D2616090, D261-6090, Ricoh transfer belt, Ricoh flat belt, Ricoh IBT belt, Ricoh Pro C5200 parts, Ricoh Pro C5210 parts, Ricoh spare parts, OEM Ricoh parts, copier parts UK, printer parts UK, transfer belt assembly, Ricoh engineer parts, copier repair parts, Burnham copier parts, Slough photocopier parts, London copier parts, Ricoh production printer parts, BuySupply parts	2026-04-21 15:01:33.42	2026-04-21 15:01:33.42	2
82	Ricoh D1796050 Transfer Belt | Pro 8100 8110 8120 | Original OEM Flat Belt	The Ricoh D1796050 Transfer Belt is a genuine OEM image transfer component designed for high-volume production printers, ensuring accurate and consistent transfer of images onto paper.\n\nThis critical part moves paper through the imaging system and transfers the toner image from the drum to the page, making it essential for maintaining sharp, aligned, and professional print quality in demanding environments.  \n\nCompatible with Ricoh Pro 8100, 8110 and 8120 series machines, this part is vital for maintaining performance and preventing print defects in production print environments.\n\n\nKey Features\n\nGenuine Ricoh OEM transfer flat belt\nPart number D1796050 (also referenced as D179-6050, D0456050) \nActs as the image transfer mechanism within the print process \nEnsures accurate image transfer and paper movement \nHigh durability with approx. 600,000 page yield (estimated) \nDesigned for high-volume production environments\nDirect replacement for worn or damaged transfer belts\nSupplied as a single unit\n\n\nCompatibility\n\nRicoh Pro 8100\nRicoh Pro 8110\nRicoh Pro 8120\nAlso compatible with Savin and Lanier equivalent models  \n\n\nWhy This Part Matters\n\nThe transfer belt is a key component in the imaging process. When worn or damaged, it can cause:\n\nImage misalignment\nGhosting or repeat images\nFaded or incomplete prints\nPaper transport issues\n\nReplacing this part restores correct image transfer and ensures consistent, high-quality output.\n\n\nWhy Buy from BuySupply\n\nFully checked and verified parts\nGenuine OEM and high-quality components\nFast UK dispatch available\nTrusted supplier of copier parts and consumables\nSupporting dealers and businesses nationwide\n\nWe supply parts locally in Burnham, Slough, Windsor and across the UK.\n\n\nIdeal For\n\nProduction print environments\nDealers servicing Ricoh production machines\nBusinesses running Pro 8100 / 8110 / 8120 series\nEngineers requiring reliable OEM replacement parts\n\n\nCondition\n\nGenuine OEM (Original Ricoh)\nBrand new condition\nSecurely packaged for safe delivery\n	\N	80	active	Ricoh D1796050, D179-6050, D0456050, Ricoh transfer belt, Ricoh flat belt, Ricoh IBT belt, Ricoh Pro 8100 parts, Ricoh Pro 8110 parts, Ricoh Pro 8120 parts, Ricoh spare parts, OEM Ricoh parts, copier parts UK, printer parts UK, transfer belt assembly, Ricoh engineer parts, copier repair parts, Burnham copier parts, Slough photocopier parts, London copier parts, Ricoh production printer parts, BuySupply parts	2026-04-21 15:11:25.527	2026-04-21 15:11:25.527	2
83	Canon FK4-6830 LCD Display Screen Unit BRAND NEW Genuine OEM ImageRUNNER ADVANCE DX Panel Screen Replacement	The Canon FK4-6830 LCD Display Unit is a BRAND NEW genuine OEM replacement screen designed for Canon imageRUNNER ADVANCE multifunction photocopiers. This component is the LCD display only (NOT a full control panel assembly), making it the ideal solution for repairing cracked, unresponsive, or dim touchscreen displays without replacing the entire panel.\n\nManufactured to Canon’s exact specifications, the FK4-6830 ensures full compatibility, reliable performance, and seamless integration with your existing control panel hardware.\n\nThis is a brand new, unused original Canon part, not refurbished or pulled, ensuring maximum lifespan and reliability.\n\nPerfect for engineers, service providers, and businesses looking to maintain or restore their copier’s user interface at a lower cost than full panel replacement.\n\nUsed across multiple Canon imageRUNNER ADVANCE and ADVANCE DX platforms with shared LCD control panel systems.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Canon OEM part\nPart number: FK4-6830\nLCD display only (NOT full control panel assembly)\nNot refurbished or used\nRestores touchscreen visibility and responsiveness\nCost-effective repair solution\nDurable, high-quality component\nIdeal for servicing and maintenance\n\nCOMPATIBILITY\n\nCompatible with a wide range of Canon imageRUNNER ADVANCE and ADVANCE DX models including (verify before purchase):\n\nCanon imageRUNNER ADVANCE C250i\nCanon imageRUNNER ADVANCE C255i\nCanon imageRUNNER ADVANCE C256iF\n\nCanon imageRUNNER ADVANCE C3320\nCanon imageRUNNER ADVANCE C3325\nCanon imageRUNNER ADVANCE C3330\n\nCanon imageRUNNER ADVANCE C350\nCanon imageRUNNER ADVANCE C351\nCanon imageRUNNER ADVANCE C355iF\n\nCanon imageRUNNER ADVANCE C5535\nCanon imageRUNNER ADVANCE C5540\nCanon imageRUNNER ADVANCE C5550\nCanon imageRUNNER ADVANCE C5560\n\nCanon imageRUNNER ADVANCE 4525i\nCanon imageRUNNER ADVANCE 4535i\nCanon imageRUNNER ADVANCE 4545i\nCanon imageRUNNER ADVANCE 4551i\n\nCanon imageRUNNER ADVANCE 525iF\nCanon imageRUNNER ADVANCE 6555i\nCanon imageRUNNER ADVANCE 6565i\nCanon imageRUNNER ADVANCE 6575i\n\nCanon imageRUNNER ADVANCE 8505i\nCanon imageRUNNER ADVANCE 8585i\nCanon imageRUNNER ADVANCE 8595i\n\nCanon imageRUNNER ADVANCE DX C357i\nCanon imageRUNNER ADVANCE DX C359i\n\nCanon imageRUNNER ADVANCE DX C3725i\nCanon imageRUNNER ADVANCE DX C3730i\n\nCanon imageRUNNER ADVANCE DX C3826i\nCanon imageRUNNER ADVANCE DX C3830i\nCanon imageRUNNER ADVANCE DX C3835i\n\nCanon imageRUNNER ADVANCE DX C478i\nCanon imageRUNNER ADVANCE DX C477iZ\n\nCanon imageRUNNER ADVANCE DX C5840i\nCanon imageRUNNER ADVANCE DX C5850i\nCanon imageRUNNER ADVANCE DX C5860i\n\nUsed across multiple Canon platforms with shared LCD control panel systems.\n\nIf unsure, message us with your model and we will confirm compatibility.\n\n\nIMPORTANT NOTE\nThis is the LCD display only, not the full control panel assembly. Please match your existing part number (FK4-6830) or contact us before purchase to confirm compatibility.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Canon part	\N	150	active	Canon FK4-6830, FK46830, Canon LCD display, Canon screen, Canon touchscreen, imageRUNNER ADVANCE parts, Canon copier parts, Canon printer parts, OEM Canon LCD, genuine Canon parts, Canon display replacement, Canon service parts, copier spare parts UK, Canon LCD panel, Burnham Slough copier parts, London copier parts, UK Canon parts supplier	2026-04-21 15:28:08.223	2026-04-21 15:28:08.223	2
85	Canon C-EXV 41 Colour Drum Unit 6370B003 BRAND NEW Genuine OEM ImageRUNNER ADVANCE C7260 C7270 C7280 C9280	The Canon C-EXV 41 Colour Drum Unit (6370B003) is a BRAND NEW genuine OEM drum cartridge designed for Canon imageRUNNER ADVANCE multifunction photocopiers. This drum unit is responsible for transferring toner onto the page, ensuring consistent, high-quality colour output and sharp image reproduction.\n\nIf your machine is producing faded prints, streaks, marks, or inconsistent colour quality, replacing the drum unit with a genuine Canon C-EXV 41 will restore optimal performance and print clarity.\n\nThis is a brand new, unused original Canon part, not refurbished or reconditioned, ensuring maximum lifespan, reliability, and print quality.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Canon OEM part\nPart number: 6370B003 (C-EXV 41)\nColour drum unit (CMY)\nNot refurbished or used\nEnsures consistent colour quality and image transfer\nHigh yield long-life component\nBuilt to Canon factory specifications\nIdeal for high-volume production environments\n\nCOMPATIBILITY\n\nCompatible with the following Canon imageRUNNER ADVANCE models:\n\nCanon imageRUNNER ADVANCE C7260\nCanon imageRUNNER ADVANCE C7270\nCanon imageRUNNER ADVANCE C7280\nCanon imageRUNNER ADVANCE C9270\nCanon imageRUNNER ADVANCE C9280 Pro\n\n✔ Confirmed across multiple suppliers and listings  \n\n\nIMPORTANT NOTE\nThis is a colour drum unit (C-EXV 41) and must match your existing part number (6370B003). Not interchangeable with other Canon drum units such as C-EXV 28, 29, or 49.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Canon part\nUnused and in excellent condition\n	\N	120	active	The Canon C-EXV 41 Colour Drum Unit (6370B003) is a BRAND NEW genuine OEM drum cartridge designed for Canon imageRUNNER ADVANCE multifunction photocopiers. This drum unit is responsible for transferring toner onto the page, ensuring consistent, high-quality colour output and sharp image reproduction.  If your machine is producing faded prints, streaks, marks, or inconsistent colour quality, replacing the drum unit with a genuine Canon C-EXV 41 will restore optimal performance and print clarity.  This is a brand new, unused original Canon part, not refurbished or reconditioned, ensuring maximum lifespan, reliability, and print quality.   KEY FEATURES  BRAND NEW genuine Canon OEM part Part number: 6370B003 (C-EXV 41) Colour drum unit (CMY) Not refurbished or used Ensures consistent colour quality and image transfer High yield long-life component Built to Canon factory specifications Ideal for high-volume production environments  COMPATIBILITY  Compatible with the following Canon imageRUNNER ADVANCE models:  Canon imageRUNNER ADVANCE C7260 Canon imageRUNNER ADVANCE C7270 Canon imageRUNNER ADVANCE C7280 Canon imageRUNNER ADVANCE C9270 Canon imageRUNNER ADVANCE C9280 Pro  ✔ Confirmed across multiple suppliers and listings     IMPORTANT NOTE This is a colour drum unit (C-EXV 41) and must match your existing part number (6370B003). Not interchangeable with other Canon drum units such as C-EXV 28, 29, or 49.   WHY BUY FROM BUYSUPPLY  UK-based supplier (Burnham, Slough) Fast dispatch and secure packaging Trusted supplier of copier parts, machines and consumables Trade and export enquiries welcome Expert support available  CONDITION Brand new genuine OEM Canon part Unused and in excellent condition	2026-04-21 15:50:16.035	2026-04-21 15:50:16.035	2
86	Canon C-EXV 61 Black Drum Unit 3759C002AA BRAND NEW Genuine OEM ImageRUNNER ADVANCE DX 6855i 6860i 6870i	The Canon C-EXV 61 Black Drum Unit (3759C002AA) is a BRAND NEW genuine OEM drum designed for Canon imageRUNNER ADVANCE DX multifunction photocopiers. This drum unit plays a critical role in producing sharp, consistent black print output by transferring toner accurately onto the page.\n\nIf your machine is showing signs of fading, streaking, ghosting, or inconsistent print quality, replacing the drum unit with a genuine Canon C-EXV 61 will restore optimal performance and reliability.\n\nThis is a brand new, unused original Canon part, not refurbished or reconditioned, ensuring maximum lifespan and professional print quality.\n\nDesigned for high-volume office environments, this drum delivers long-lasting performance with a very high page yield.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Canon OEM part\nPart number: 3759C002AA (C-EXV 61)\nBlack drum unit\nNot refurbished or used\nApproximate yield: up to 488,000 pages  \nEnsures sharp, consistent black print quality\nLong-life component for high-volume environments\nBuilt to Canon factory specifications\n\nCOMPATIBILITY\n\nCompatible with Canon imageRUNNER ADVANCE DX 6800 series machines including:\n\nCanon imageRUNNER ADVANCE DX 6855i\nCanon imageRUNNER ADVANCE DX 6860i\nCanon imageRUNNER ADVANCE DX 6870i\n\n✔ Also commonly referenced as fitting the wider DX 6800 series platform  \n\nIf unsure, message us with your model and we will confirm compatibility.\n\n\nIMPORTANT NOTE\nThis drum unit is specific to the Canon DX 6800 series platform. Please ensure your existing part number matches C-EXV 61 / 3759C002AA before purchasing.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Canon part\nUnused and in excellent condition	\N	150	active	Canon C-EXV 61, 3759C002, Canon drum unit, Canon black drum, Canon copier drum, imageRUNNER ADVANCE DX parts, Canon copier parts, Canon printer parts, OEM Canon drum, genuine Canon parts, Canon drum replacement, Canon service parts, copier spare parts UK, Burnham Slough copier parts, London copier parts, UK Canon parts supplier	2026-04-21 15:55:17.25	2026-04-21 15:55:17.25	2
88	Ricoh D258-3531 Charge Unit BRAND NEW Genuine OEM MP C6503 C8003 IM C6500 IM C8000	The Ricoh D258-3531 Charge Unit is a BRAND NEW genuine OEM component designed for Ricoh multifunction photocopiers. This unit plays a critical role in the imaging process by applying an electrostatic charge to the drum, ensuring accurate toner transfer and consistent, high-quality print output.\n\nIf your machine is experiencing print defects such as streaking, uneven density, background shading, or image quality issues, replacing the charge unit will help restore optimal performance.\n\nThis is a brand new, unused original Ricoh part, not refurbished or reconditioned, ensuring maximum reliability, lifespan, and print quality.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Ricoh OEM part\nPart number: D258-3531\nDrum charge unit (imaging component)\nNot refurbished or used\nEnsures proper electrostatic charge for image transfer\nImproves print quality and consistency\nEssential maintenance component\nBuilt to Ricoh factory specifications\n\nCOMPATIBILITY\n\nCompatible with the following Ricoh models:\n\nRicoh MP C6503\nRicoh MP C8003\n\nRicoh IM C6500\nRicoh IM C8000\n\n✔ Confirmed across multiple suppliers and listings  \n\nAlso used across equivalent platforms (including Savin / Lanier variants of the same machines).  \n\nIf unsure, message us with your model and we will confirm compatibility.\n\n\nIMPORTANT NOTE\nThis is a model-specific charge unit. Please ensure your existing part number matches D258-3531 before purchasing. Installation is recommended by a qualified engineer.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Ricoh part	\N	72	active	Ricoh D258-3531, D2583531, Ricoh charge unit, Ricoh drum charge unit, Ricoh copier parts, Ricoh printer parts, MP C6503 parts, MP C8003 parts, IM C6500 parts, IM C8000 parts, OEM Ricoh parts, genuine Ricoh parts, Ricoh service parts, copier spare parts UK, Burnham Slough copier parts, London copier parts, UK Ricoh parts supplier	2026-04-21 16:12:30.187	2026-04-21 16:12:30.187	2
87	Canon FM1-W520-000 SSD Unit BRAND NEW Genuine OEM ImageRUNNER ADVANCE DX C5850i C5860i C5870i 6855i	The Canon FM1-W520-000 SSD Unit is a BRAND NEW genuine OEM solid state drive designed for Canon imageRUNNER ADVANCE DX multifunction photocopiers. This high-speed internal storage device is responsible for system operation, job processing, scanning workflows, and secure data handling.\n\nCompared to older HDD-based systems, this SSD unit delivers faster performance, improved reliability, and enhanced data access speeds, making it ideal for high-volume office environments.\n\nIf your machine is experiencing slow performance, boot issues, storage faults, or SSD-related errors, replacing the unit with a genuine Canon FM1-W520-000 will restore full functionality and system stability.\n\nThis is a brand new, unused original Canon part, not refurbished or reconditioned, ensuring maximum lifespan and performance.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Canon OEM part\nPart number: FM1-W520-000\nSolid State Drive (SSD) unit\nFaster and more reliable than traditional HDD\nNot refurbished or used\nSupports system operations, print jobs and scanning workflows\nImproves machine responsiveness and performance\nBuilt to Canon factory specifications\n\nCOMPATIBILITY\n\nCompatible with the following Canon imageRUNNER ADVANCE DX models:\n\nCanon imageRUNNER ADVANCE DX C5850i\nCanon imageRUNNER ADVANCE DX C5860i\nCanon imageRUNNER ADVANCE DX C5870i\nCanon imageRUNNER ADVANCE DX 6855i\n\n✔ Confirmed from supplier data  \n\nIf unsure, message us with your model and we will confirm compatibility.\n\n\nIMPORTANT NOTE\nThis SSD unit is model-specific and designed for selected imageRUNNER ADVANCE DX platforms. Please ensure your existing part number matches FM1-W520-000 before purchasing. Installation may require configuration or firmware setup by a qualified engineer.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Canon part	\N	195	active	Canon FM1-W520-000, FM1W520000, Canon SSD, Canon solid state drive, Canon copier SSD, imageRUNNER ADVANCE DX parts, Canon copier parts, Canon printer parts, OEM Canon SSD, genuine Canon parts, Canon storage drive, Canon service parts, copier spare parts UK, Burnham Slough copier parts, London copier parts, UK Canon parts supplier	2026-04-21 16:01:47.012	2026-04-21 16:12:46.929	2
89	Canon FM0-0318 HDD Hard Disk Drive BRAND NEW Genuine OEM ImageRUNNER ADVANCE C5235 C5240 C5250 C5255	The Canon FM0-0318 HDD is a BRAND NEW genuine OEM hard disk drive designed specifically for Canon imageRUNNER ADVANCE C5200 series multifunction photocopiers. This internal storage device is responsible for system operation, print job processing, scanning workflows, and secure data storage.\n\nIf your machine is experiencing boot errors, HDD faults, data corruption, or job storage issues, replacing the hard drive with a genuine Canon FM0-0318 unit will restore full functionality and reliability.\n\nThis is a brand new, unused original Canon part, not refurbished or reconditioned, ensuring maximum performance, compatibility, and lifespan.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Canon OEM part\nPart number: FM0-0318-000\nHard disk drive (HDD) unit\nTypically 2.5” SATA internal drive\nNot refurbished or used\nRestores system performance and data functionality\nSupports print, scan, and document storage features\nBuilt to Canon factory specifications\n\nCOMPATIBILITY\n\nCompatible ONLY with the following Canon imageRUNNER ADVANCE models:\n\nCanon imageRUNNER ADVANCE C5235\nCanon imageRUNNER ADVANCE C5240\nCanon imageRUNNER ADVANCE C5250\nCanon imageRUNNER ADVANCE C5255\n\nThis HDD is specific to the C5200 series platform and is not interchangeable with newer imageRUNNER ADVANCE or DX models.  \n\nIf unsure, message us with your model and we will confirm compatibility.\n\n\nIMPORTANT NOTE\nThis is a model-specific HDD. Please ensure your existing part number matches FM0-0318 before purchasing. Installation may require firmware setup or configuration by a qualified engineer.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Canon part\nUnused and in excellent condition	\N	125	active	Canon FM0-0318, FM00318, Canon HDD, Canon hard drive, Canon copier HDD, imageRUNNER ADVANCE C5235 parts, Canon C5240 HDD, Canon C5250 HDD, Canon C5255 HDD, OEM Canon HDD, genuine Canon parts, Canon storage drive, Canon service parts, copier spare parts UK, Burnham Slough copier parts, London copier parts, UK Canon parts supplier	2026-04-21 16:16:25.907	2026-04-21 16:16:42.865	2
91	Ricoh M0ED9510 OPC Drum Unit Genuine OEM Photoconductor Pro C9100 C9110 C9200 C9210	The Ricoh M0ED9510 OPC Drum Unit is a genuine OEM photoconductor designed for high-volume production print environments. Built for reliability and precision, this drum ensures consistent, sharp, and professional-quality output.\n\nEngineered for Ricoh Pro series machines, this unit supports heavy-duty workloads while maintaining excellent image transfer and print clarity. Ideal for commercial print rooms and businesses requiring dependable, high-output performance.\n\nWith a high page yield and long service life, the M0ED9510 helps reduce downtime and maintain efficiency in demanding environments.\n\nKey Features:\n\nGenuine OEM Ricoh part\nPart Number: M0ED9510 (also known as M2059510)\nProduct Type: OPC / Photoconductor Drum\nHigh yield approx. 900,000 – 1,800,000 pages\nDesigned for production print environments\nReliable and consistent print quality\nCompatible Models:\nRicoh Pro C9100\nRicoh Pro C9110\nRicoh Pro C9200\nRicoh Pro C9210\n\nWhat’s Included:\n1 x Ricoh M0ED9510 OPC Drum Unit\n\nWhy Buy From BuySupply:\n\nUK trusted supplier of copier parts\nGenuine, brand new OEM stock\nFast UK dispatch\nTrade pricing available\n	\N	165	active	ricoh m0ed9510, ricoh m2059510, ricoh drum unit, ricoh opc drum, ricoh photoconductor, ricoh pro c9100 drum, ricoh pro c9110 drum, ricoh pro c9200 drum, ricoh pro c9210 drum, ricoh production printer parts, ricoh spare parts uk, genuine ricoh drum, oem ricoh parts, copier drum unit uk, printer drum replacement, ricoh pro series parts, buysupply, buysupply slough, buysupply burnham, copier parts slough, copier parts burnham, copier parts london, printer parts uk, production printer drum	2026-04-22 11:39:06.731	2026-04-22 11:39:06.731	2
92	Genuine Ricoh D0BQ4056 Fusing Sleeve | IM C4500 / IM C5500 / IM C6000 OEM	The Genuine Ricoh D0BQ4056 Fusing Sleeve is an original OEM replacement component designed for Ricoh IM C4500, IM C5500 and IM C6000 colour multifunction printers.\n\nThis fusing sleeve plays a critical role in the printing process by ensuring toner is properly bonded to the page, delivering sharp, professional print quality and reliable performance. Ideal for servicing, maintenance or repair, this genuine Ricoh part guarantees correct fitment and long-lasting durability.\n\nSuitable for engineers, service providers and businesses maintaining high-performance Ricoh office devices.\n\n\nKey Features\n\nGenuine Ricoh OEM part\nPart number: D0BQ4056\nDesigned for consistent fusing performance\nMaintains print quality and reliability\nIdeal for servicing and preventative maintenance\nHigh durability and precise fit\n\nCompatible Models\n\nRicoh IM C4500\nRicoh IM C5500\nRicoh IM C6000\n\nWhy Buy From BuySupply?\n\n✔ Trusted UK supplier of copier parts & machines\n✔ All parts checked and verified before dispatch\n✔ Fast UK delivery available\n✔ Experienced team with industry expertise\n✔ Based in Burnham, Slough – serving UK & export markets\n	\N	160	active	Ricoh D0BQ4056, D0BQ-4056, Ricoh fusing sleeve, Ricoh sleeve unit, Ricoh fuser sleeve, genuine Ricoh, original Ricoh, OEM Ricoh, Ricoh IM C4500, Ricoh IM C5500, Ricoh IM C6000, Ricoh parts UK, copier parts, printer parts, photocopier parts, Ricoh spare parts, BuySupply, Burnham, Slough, UK copier parts	2026-04-22 13:17:20.123	2026-04-22 13:17:20.123	2
93	Genuine Ricoh D0BM2215 Black Drum Unit / PCU | IM C3000 / C3500 / C4500 / C6000 ORIGINAL OEM UK	The Genuine Ricoh D0BM2215 Black Drum Unit / PCU is an original OEM imaging unit designed for selected Ricoh IM C-series colour multifunction printers. This black process unit plays a key role in producing clean, sharp black output and maintaining reliable print quality throughout the life of the machine. It is ideal for servicing, repairs, and preventative maintenance where consistent performance and correct fit are essential. Genuine Ricoh parts help ensure dependable operation, proper compatibility, and long-lasting results.  \n\nKey Features\n\nGenuine Ricoh OEM part\nPart number: D0BM2215\nBlack drum unit / PCU / imaging unit\nDesigned for reliable print quality and machine performance\nIdeal for maintenance, servicing, and repair\nCorrect fit for compatible Ricoh IM C-series devices  \n\nCompatible Models\n\nRicoh IM C3000\nRicoh IM C3500\nRicoh IM C4500\nRicoh IM C6000  \n\nWhy Buy From BuySupply?\n\nTrusted UK supplier of copier parts and machines\nGenuine OEM parts for reliable compatibility\nFast UK dispatch available\nExperienced photocopier trade supplier\nBased in Burnham, Slough, serving UK and export customers\n	\N	200	active	Ricoh D0BM2215, D0BM-2215, Ricoh black drum unit, Ricoh black PCU, Ricoh imaging drum, Ricoh process unit, genuine Ricoh, original Ricoh, OEM Ricoh, Ricoh IM C3000, Ricoh IM C3500, Ricoh IM C4500, Ricoh IM C6000, Ricoh parts UK, copier parts, printer parts, photocopier parts, BuySupply, Burnham, Slough	2026-04-22 13:38:07.477	2026-04-22 13:38:07.477	2
94	Genuine Ricoh D0CB4032 OEM Genuine Fusing Unit for Ricoh IM C300 / IM C400 OEM ORIGINAL UK	Ricoh D0CB4032 is a genuine OEM fusing unit designed for reliable performance and consistent print quality in compatible Ricoh multifunction printers. As an original Ricoh part, it is built to the correct specification for proper fit, dependable operation, and long service life.\n\n\n\nThis genuine Ricoh fusing unit is ideal for replacing a worn or faulty fuser assembly and helping restore sharp, clean output while reducing the risk of print defects and downtime. OEM parts are the best choice for businesses that want dependable results and full compatibility.\n\n\n\nProduct code: D0CB4032\nType: Genuine OEM Ricoh fusing unit\nBrand: Ricoh\nPack size: 1\n\n\n\nSuitable for Ricoh IM C300 / IM C400 series machines.\n\n\n\nAt BuySupply, we supply genuine Ricoh parts, consumables, printers, and photocopiers to customers in Burnham, Slough, London, and across the UK. If you need help checking compatibility for your machine, contact us before ordering.	\N	135	active	Ricoh D0CB4032, D0CB4032, Ricoh fusing unit, Ricoh fuser unit, genuine Ricoh fusing unit, OEM Ricoh D0CB4032, Ricoh IM C300 fuser, Ricoh IM C400 fuser, Ricoh IM C300 parts, Ricoh IM C400 parts, Ricoh printer parts, Ricoh copier parts, genuine Ricoh parts, OEM Ricoh parts, Ricoh spare parts UK, Ricoh fuser assembly, BuySupply Ricoh parts, Ricoh parts Burnham, Ricoh parts Slough, Ricoh parts London, photocopier parts UK, printer parts UK	2026-04-22 14:03:32.93	2026-04-22 14:03:32.93	2
95	Genuine Ricoh D2970121 OEM  Black PCDU Drum & Developer Unit for MP C306 / C406 OEM ORIGINAL UK	Ricoh D2970121 is a genuine OEM black PCDU (Photoconductor Drum & Developer Unit) designed to deliver consistent, high-quality print performance in compatible Ricoh multifunction devices. As an original Ricoh component, it ensures perfect compatibility, reliable operation, and long service life.\n\nThis unit combines both the drum and developer assembly, making it a critical component for maintaining sharp image quality, accurate toner transfer, and overall machine performance. Ideal for replacing worn imaging units and reducing downtime in busy office environments.\n\nProduct code: D2970121\nType: Genuine OEM PCDU (Drum & Developer Unit)\nColour: Black\nBrand: Ricoh\nCondition: New\n\nCompatible with a wide range of Ricoh machines including MP C306, and MP C406 series devices.  \n\nTypical page yield is up to approximately 60,000 pages (coverage dependent), making it a reliable long-life component for business use.  \n\nAt BuySupply, we supply genuine Ricoh parts, consumables, printers, and photocopiers across Burnham, Slough, London, and the UK. If you’re unsure about compatibility, contact us and we’ll confirm before purchase.\n	\N	150	active	Ricoh D2970121, D2970121, Ricoh drum unit, Ricoh PCDU, Ricoh developer unit, Ricoh drum and developer, Ricoh black drum unit, OEM Ricoh D2970121, genuine Ricoh parts, Ricoh MP C306 drum, Ricoh MP C307 drum, Ricoh MP C406 drum, Ricoh MP C306 parts, Ricoh MP C307 parts, Ricoh MP C406 parts, Ricoh copier parts, Ricoh printer parts, Ricoh imaging unit, photocopier drum unit UK, printer drum unit UK, Ricoh parts UK, BuySupply Ricoh parts, Ricoh parts Burnham, Ricoh parts Slough, Ricoh parts London	2026-04-22 14:33:09.931	2026-04-22 14:33:09.931	2
96	Genuine Canon FM1-N265-010 Transfer Belt ITB for imageRUNNER ADVANCE C5535i / C5540i / C5550i / C5560i OEM ORIGINAL UK	Canon FM1-N265-010 is a genuine OEM transfer belt (ITB – Intermediate Transfer Belt) designed to ensure precise colour alignment and high-quality image transfer in compatible Canon multifunction printers.\n\nAs an original Canon part, this transfer belt is manufactured to exact specifications, providing reliable performance, consistent output, and long operational life. It plays a critical role in transferring toner from the drum units onto paper, ensuring sharp detail and accurate colour reproduction.\n\nIdeal for replacing worn or damaged transfer assemblies, this unit helps maintain print quality while reducing downtime in busy office environments.\n\nProduct code: FM1-N265-010\nAlso known as: FM1-N265-000\nType: Genuine OEM ITB / Transfer Belt\nBrand: Canon\nCondition: New\n\nCompatible with Canon imageRUNNER ADVANCE series including C5535i, C5540i, C5550i and C5560i models.  \n \n\nAt BuySupply, we supply genuine Canon parts, printers, and consumables across Burnham, Slough, London, and the UK. Contact us if you need help confirming compatibility before purchase.	\N	195	active	Canon FM1-N265-010, FM1-N265-010, FM1-N265-000, Canon transfer belt, Canon ITB, Canon intermediate transfer belt, genuine Canon transfer belt, OEM Canon FM1-N265-010, Canon C5535i transfer belt, Canon C5540i transfer belt, Canon C5550i transfer belt, Canon C5560i transfer belt, Canon imageRUNNER parts, Canon copier parts, Canon printer parts, Canon spare parts UK, Canon ITB unit, photocopier transfer belt UK, printer transfer belt UK, BuySupply Canon parts, Canon parts Burnham, Canon parts Slough, Canon parts London	2026-04-22 14:43:21.466	2026-04-22 14:44:28.218	2
97	Canon FM3-5951-020 OEM Genuine Fixing Film Unit for imageRUNNER ADVANCE C5030 / C5035 / C5045 / C5051 / C5235 / C5245	Canon FM3-5951-020 is a genuine OEM fixing film unit designed to maintain consistent fusing performance and high-quality print output in compatible Canon multifunction printers.\n\nThis fixing film (fuser film sleeve) is a critical component within the fusing assembly, responsible for applying heat and pressure to bond toner onto the paper. Using a genuine Canon part ensures optimal performance, correct temperature control, and long operational life while reducing the risk of print defects such as smudging, ghosting, or poor adhesion.\n\nIdeal for replacing worn or damaged fixing films in high-volume office environments, helping restore print quality and minimise machine downtime.\n\nProduct code: FM3-5951-020\nAlso known as: FM3-5951-010 / FM3-5951-000\nType: Genuine OEM Fixing Film Unit (Fuser Film Sleeve)\nBrand: Canon\nCondition: New\n\nCompatible with Canon imageRUNNER ADVANCE series including C5030, C5035, C5045, C5051, C5235 and C5245 models.  \n\nAlso used across a wider platform including C5240, C5250 and C5255 series machines using the same fusing system.  \n\nAt BuySupply, we supply genuine Canon parts, printers, and consumables across Burnham, Slough, London, and the UK. Contact us if you need help confirming compatibility before purchase.	\N	200	active	Canon FM3-5951-020, FM3-5951-020, FM3-5951-010, FM3-5951-000, Canon fixing film unit, Canon fuser film, Canon fixing film sleeve, Canon fusing film, genuine Canon fixing film, OEM Canon FM3-5951-020, Canon C5030 fixing film, Canon C5035 fixing film, Canon C5045 fixing film, Canon C5051 fixing film, Canon C5235 fixing film, Canon C5245 fixing film, Canon imageRUNNER parts, Canon copier parts, Canon printer parts, Canon spare parts UK, photocopier fuser film UK, printer fixing film UK, BuySupply Canon parts, Canon parts Burnham, Canon parts Slough, Canon parts London	2026-04-22 15:15:39.025	2026-04-22 15:15:39.025	2
84	Canon FM0-0318 HDD Hard Disk Drive BRAND NEW Genuine OEM ImageRUNNER ADVANCE C5235 C5240 C5250 C5255	The Canon FM0-0318 HDD is a BRAND NEW genuine OEM hard disk drive designed specifically for Canon imageRUNNER ADVANCE C5200 series multifunction photocopiers. This internal storage device is responsible for system operation, print job processing, scanning workflows, and secure data storage.\n\nIf your machine is experiencing boot errors, HDD faults, data corruption, or job storage issues, replacing the hard drive with a genuine Canon FM0-0318 unit will restore full functionality and reliability.\n\nThis is a brand new, unused original Canon part, not refurbished or reconditioned, ensuring maximum performance, compatibility, and lifespan.\n\n\nKEY FEATURES\n\nBRAND NEW genuine Canon OEM part\nPart number: FM0-0318-000\nHard disk drive (HDD) unit\nTypically 2.5” SATA internal drive\nNot refurbished or used\nRestores system performance and data functionality\nSupports print, scan, and document storage features\nBuilt to Canon factory specifications\n\nCOMPATIBILITY\n\nCompatible ONLY with the following Canon imageRUNNER ADVANCE models:\n\nCanon imageRUNNER ADVANCE C5235\nCanon imageRUNNER ADVANCE C5240\nCanon imageRUNNER ADVANCE C5250\nCanon imageRUNNER ADVANCE C5255\n\nThis HDD is specific to the C5200 series platform and is not interchangeable with newer imageRUNNER ADVANCE or DX models.  \n\nIf unsure, message us with your model and we will confirm compatibility.\n\n\nIMPORTANT NOTE\nThis is a model-specific HDD. Please ensure your existing part number matches FM0-0318 before purchasing. Installation may require firmware setup or configuration by a qualified engineer.\n\n\nWHY BUY FROM BUYSUPPLY\n\nUK-based supplier (Burnham, Slough)\nFast dispatch and secure packaging\nTrusted supplier of copier parts, machines and consumables\nTrade and export enquiries welcome\nExpert support available\n\nCONDITION\nBrand new genuine OEM Canon part\nUnused and in excellent condition	\N	125	active	Canon FM0-0318, FM00318, Canon HDD, Canon hard drive, Canon copier HDD, imageRUNNER ADVANCE C5235 parts, Canon C5240 HDD, Canon C5250 HDD, Canon C5255 HDD, OEM Canon HDD, genuine Canon parts, Canon storage drive, Canon service parts, copier spare parts UK, Burnham Slough copier parts, London copier parts, UK Canon parts supplier	2026-04-21 15:37:33.123	2026-04-22 15:16:42.862	2
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductImage" (id, "productId", "categoryId", url, key, "isPrimary", "order", "createdAt") FROM stdin;
295	81	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMGK7h3vgye9hxqfP7ZJKEQ0Nu5n2UszpbXrjR	BafdMI4pfuXMGK7h3vgye9hxqfP7ZJKEQ0Nu5n2UszpbXrjR	t	0	2026-04-21 15:01:33.42
213	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMYNVDoaL8465v3bphG1RidSjW7eV9OIX2gkME	BafdMI4pfuXMYNVDoaL8465v3bphG1RidSjW7eV9OIX2gkME	t	0	2026-04-21 08:57:45.559
214	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMoVC3mRIA31WReD8gLkS6OPjE0Cho2MFHdc7I	BafdMI4pfuXMoVC3mRIA31WReD8gLkS6OPjE0Cho2MFHdc7I	f	0	2026-04-21 08:57:45.559
201	59	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMUlIk4NLoyekMJIgiDchuABvtNP3G2Rf5q61H	BafdMI4pfuXMUlIk4NLoyekMJIgiDchuABvtNP3G2Rf5q61H	t	0	2026-04-21 08:10:42.206
202	59	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMlTYoIDyddgJ73NeBbWKr0nIPSaQtiYD2kw8f	BafdMI4pfuXMlTYoIDyddgJ73NeBbWKr0nIPSaQtiYD2kw8f	f	0	2026-04-21 08:10:42.206
203	59	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMoetTyaIA31WReD8gLkS6OPjE0Cho2MFHdc7I	BafdMI4pfuXMoetTyaIA31WReD8gLkS6OPjE0Cho2MFHdc7I	f	0	2026-04-21 08:10:42.206
204	59	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMLPcwpRf2H7lcNxRmOIM9Psu5w1VXCj0bWqFA	BafdMI4pfuXMLPcwpRf2H7lcNxRmOIM9Psu5w1VXCj0bWqFA	f	0	2026-04-21 08:10:42.206
205	59	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMQc685MSsvmMGnzyFjSAoPrbgWYwiOK8k9UVC	BafdMI4pfuXMQc685MSsvmMGnzyFjSAoPrbgWYwiOK8k9UVC	f	0	2026-04-21 08:10:42.206
215	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMSyNXZRKUXprwg8WE35e4jbKsCxkT1NYIcaLS	BafdMI4pfuXMSyNXZRKUXprwg8WE35e4jbKsCxkT1NYIcaLS	f	0	2026-04-21 08:57:45.559
216	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM5NYjheRnQbG4Po6plLWRDYN3sUji1B0AwFrV	BafdMI4pfuXM5NYjheRnQbG4Po6plLWRDYN3sUji1B0AwFrV	f	0	2026-04-21 08:57:45.559
217	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMTuYIar5fpvkKBRLgn91AhtQwyr6qZa0i8d3c	BafdMI4pfuXMTuYIar5fpvkKBRLgn91AhtQwyr6qZa0i8d3c	f	0	2026-04-21 08:57:45.559
212	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMGOaxZdNgye9hxqfP7ZJKEQ0Nu5n2UszpbXrj	BafdMI4pfuXMGOaxZdNgye9hxqfP7ZJKEQ0Nu5n2UszpbXrj	f	0	2026-04-21 08:57:45.559
219	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMS98zR1nKUXprwg8WE35e4jbKsCxkT1NYIcaL	BafdMI4pfuXMS98zR1nKUXprwg8WE35e4jbKsCxkT1NYIcaL	f	0	2026-04-21 08:57:45.559
218	61	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMS7lpwUKUXprwg8WE35e4jbKsCxkT1NYIcaLS	BafdMI4pfuXMS7lpwUKUXprwg8WE35e4jbKsCxkT1NYIcaLS	f	0	2026-04-21 08:57:45.559
196	58	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMyiw2xG89icA3w4Ph2FTzJ0blDtNLnS6xqRXZ	BafdMI4pfuXMyiw2xG89icA3w4Ph2FTzJ0blDtNLnS6xqRXZ	f	3	2026-04-21 07:57:14.446
199	58	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMlqBY0NddgJ73NeBbWKr0nIPSaQtiYD2kw8f9	BafdMI4pfuXMlqBY0NddgJ73NeBbWKr0nIPSaQtiYD2kw8f9	f	4	2026-04-21 07:57:14.446
198	58	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMqzsdt3nroUKai27WDhtMlfBR16p3ZTjVdIwv	BafdMI4pfuXMqzsdt3nroUKai27WDhtMlfBR16p3ZTjVdIwv	f	1	2026-04-21 07:57:14.446
195	58	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMhUqwPFu01OHS59gQvloLpeMjIByUmzFxCEX2	BafdMI4pfuXMhUqwPFu01OHS59gQvloLpeMjIByUmzFxCEX2	f	2	2026-04-21 07:57:14.446
200	58	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMaGCnoN3c1Welri7qHg5aUB4wn89JvPR2pYzX	BafdMI4pfuXMaGCnoN3c1Welri7qHg5aUB4wn89JvPR2pYzX	f	5	2026-04-21 07:57:14.446
229	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMkhbtdLNc2QH5X04ApgewIxPvF3Y81EBtmlhV	BafdMI4pfuXMkhbtdLNc2QH5X04ApgewIxPvF3Y81EBtmlhV	f	0	2026-04-21 09:32:46.56
225	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMIFrEk8l2smvxYphGLkEXHaTCPD6bSlZt9dQM	BafdMI4pfuXMIFrEk8l2smvxYphGLkEXHaTCPD6bSlZt9dQM	f	0	2026-04-21 09:32:46.56
249	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMdVuGg4mDnoqgj28zVZtUh4SGAH13dXi9bfME	BafdMI4pfuXMdVuGg4mDnoqgj28zVZtUh4SGAH13dXi9bfME	f	0	2026-04-21 13:30:08.674
246	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMS3tJ4kKUXprwg8WE35e4jbKsCxkT1NYIcaLS	BafdMI4pfuXMS3tJ4kKUXprwg8WE35e4jbKsCxkT1NYIcaLS	f	0	2026-04-21 13:30:08.674
207	60	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMYZRagjL8465v3bphG1RidSjW7eV9OIX2gkME	BafdMI4pfuXMYZRagjL8465v3bphG1RidSjW7eV9OIX2gkME	f	0	2026-04-21 08:17:06.97
208	60	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMNmXftvqcqD5CiJTdQAr1HbyZlw8EXOSjRh49	BafdMI4pfuXMNmXftvqcqD5CiJTdQAr1HbyZlw8EXOSjRh49	f	0	2026-04-21 08:17:06.97
209	60	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMGlRf7sgye9hxqfP7ZJKEQ0Nu5n2UszpbXrjR	BafdMI4pfuXMGlRf7sgye9hxqfP7ZJKEQ0Nu5n2UszpbXrjR	f	0	2026-04-21 08:17:06.97
210	60	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMEEF6zKyl54tqxc3ZwFPaApD28Q7ikhz6IfXW	BafdMI4pfuXMEEF6zKyl54tqxc3ZwFPaApD28Q7ikhz6IfXW	f	0	2026-04-21 08:17:06.97
211	60	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMoAF1DDIA31WReD8gLkS6OPjE0Cho2MFHdc7I	BafdMI4pfuXMoAF1DDIA31WReD8gLkS6OPjE0Cho2MFHdc7I	f	0	2026-04-21 08:17:06.97
248	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMKCmqceQVOBbL0a9AP8pxiFvoNgHCZu5SGQqs	BafdMI4pfuXMKCmqceQVOBbL0a9AP8pxiFvoNgHCZu5SGQqs	f	0	2026-04-21 13:30:08.674
224	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMXYn7NXEGs7EDfePOUiaSCBFzoyjWJ0hxb2Z3	BafdMI4pfuXMXYn7NXEGs7EDfePOUiaSCBFzoyjWJ0hxb2Z3	t	0	2026-04-21 09:32:46.56
226	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM4fs8bdlYatnIsmROMj8prqWlXDKVoEeH3ic7	BafdMI4pfuXM4fs8bdlYatnIsmROMj8prqWlXDKVoEeH3ic7	f	0	2026-04-21 09:32:46.56
230	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMdWOO2hmDnoqgj28zVZtUh4SGAH13dXi9bfME	BafdMI4pfuXMdWOO2hmDnoqgj28zVZtUh4SGAH13dXi9bfME	f	0	2026-04-21 09:32:46.56
228	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMdkHVlvmDnoqgj28zVZtUh4SGAH13dXi9bfME	BafdMI4pfuXMdkHVlvmDnoqgj28zVZtUh4SGAH13dXi9bfME	f	0	2026-04-21 09:32:46.56
227	63	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMN2UPLVqcqD5CiJTdQAr1HbyZlw8EXOSjRh49	BafdMI4pfuXMN2UPLVqcqD5CiJTdQAr1HbyZlw8EXOSjRh49	f	0	2026-04-21 09:32:46.56
245	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMWC6a7XQyFVtPnEgGXT7Uf8Kwlv6Nsr9BeuhH	BafdMI4pfuXMWC6a7XQyFVtPnEgGXT7Uf8Kwlv6Nsr9BeuhH	f	0	2026-04-21 13:30:08.674
206	60	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM97BFFlCFa2x1qtdOkJgXUop4S6jAY0fwHliI	BafdMI4pfuXM97BFFlCFa2x1qtdOkJgXUop4S6jAY0fwHliI	t	0	2026-04-21 08:17:06.97
247	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMw2pyVaWOphiFV67RCQa8wtHZTXqkx25yIouP	BafdMI4pfuXMw2pyVaWOphiFV67RCQa8wtHZTXqkx25yIouP	f	0	2026-04-21 13:30:08.674
250	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMOEAdnHZBW1Yxonkp0hUXatRVu4rMdSAGJON3	BafdMI4pfuXMOEAdnHZBW1Yxonkp0hUXatRVu4rMdSAGJON3	f	0	2026-04-21 13:30:08.674
244	68	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMS7Z5tiKUXprwg8WE35e4jbKsCxkT1NYIcaLS	BafdMI4pfuXMS7Z5tiKUXprwg8WE35e4jbKsCxkT1NYIcaLS	t	0	2026-04-21 13:30:08.674
252	69	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM5NMmG4PnQbG4Po6plLWRDYN3sUji1B0AwFrV	BafdMI4pfuXM5NMmG4PnQbG4Po6plLWRDYN3sUji1B0AwFrV	f	1	2026-04-21 14:11:33.491
253	69	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM2wnkCIaEhpbU5QLr8o3XTIM72uy6xalWckfe	BafdMI4pfuXM2wnkCIaEhpbU5QLr8o3XTIM72uy6xalWckfe	f	2	2026-04-21 14:11:33.491
255	69	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMx6Getn7QEbZeNB2TUdDSz3a0wnpKVsJojXLF	BafdMI4pfuXMx6Getn7QEbZeNB2TUdDSz3a0wnpKVsJojXLF	f	4	2026-04-21 14:11:33.491
197	58	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMWnOVYmQyFVtPnEgGXT7Uf8Kwlv6Nsr9BeuhH	BafdMI4pfuXMWnOVYmQyFVtPnEgGXT7Uf8Kwlv6Nsr9BeuhH	t	0	2026-04-21 07:57:14.446
251	69	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMw21sV3NOphiFV67RCQa8wtHZTXqkx25yIouP	BafdMI4pfuXMw21sV3NOphiFV67RCQa8wtHZTXqkx25yIouP	t	0	2026-04-21 14:11:33.491
254	69	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMQtEsMbSsvmMGnzyFjSAoPrbgWYwiOK8k9UVC	BafdMI4pfuXMQtEsMbSsvmMGnzyFjSAoPrbgWYwiOK8k9UVC	f	3	2026-04-21 14:11:33.491
296	81	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMmSZ42HTCZOVx6MQGyRJt1nicghkbaPK2fwuj	BafdMI4pfuXMmSZ42HTCZOVx6MQGyRJt1nicghkbaPK2fwuj	f	1	2026-04-21 15:01:33.42
297	82	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMCEMt6tAFkAeYUXP6uWmQwR0KbjfOVgxJH3dS	BafdMI4pfuXMCEMt6tAFkAeYUXP6uWmQwR0KbjfOVgxJH3dS	t	0	2026-04-21 15:11:25.527
298	82	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMFHlndwUw03j7qNTlKeaZRtVWxsz4PnJhiAbC	BafdMI4pfuXMFHlndwUw03j7qNTlKeaZRtVWxsz4PnJhiAbC	f	1	2026-04-21 15:11:25.527
299	83	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMFOcvHMUw03j7qNTlKeaZRtVWxsz4PnJhiAbC	BafdMI4pfuXMFOcvHMUw03j7qNTlKeaZRtVWxsz4PnJhiAbC	t	0	2026-04-21 15:28:08.223
302	85	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMVnkixe9CT5X2ID86BxlJMrufbh7Htoi0ELOF	BafdMI4pfuXMVnkixe9CT5X2ID86BxlJMrufbh7Htoi0ELOF	t	0	2026-04-21 15:50:16.035
303	86	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMk12Uw6Nc2QH5X04ApgewIxPvF3Y81EBtmlhV	BafdMI4pfuXMk12Uw6Nc2QH5X04ApgewIxPvF3Y81EBtmlhV	t	0	2026-04-21 15:55:17.25
260	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMFIqWPoBUw03j7qNTlKeaZRtVWxsz4PnJhiAb	BafdMI4pfuXMFIqWPoBUw03j7qNTlKeaZRtVWxsz4PnJhiAb	t	0	2026-04-21 14:21:53.027
261	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMBchK7h4pfuXMZj9QDoUsl0eYNzCEq1n8dJVF	BafdMI4pfuXMBchK7h4pfuXMZj9QDoUsl0eYNzCEq1n8dJVF	f	1	2026-04-21 14:21:53.027
262	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMFgoecbUw03j7qNTlKeaZRtVWxsz4PnJhiAbC	BafdMI4pfuXMFgoecbUw03j7qNTlKeaZRtVWxsz4PnJhiAbC	f	2	2026-04-21 14:21:53.027
263	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMevxSudByXRlAWJ2vVTN3Y71uwoxUmz0ih8f6	BafdMI4pfuXMevxSudByXRlAWJ2vVTN3Y71uwoxUmz0ih8f6	f	3	2026-04-21 14:21:53.027
264	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMX8n4NQMEGs7EDfePOUiaSCBFzoyjWJ0hxb2Z	BafdMI4pfuXMX8n4NQMEGs7EDfePOUiaSCBFzoyjWJ0hxb2Z	f	4	2026-04-21 14:21:53.027
265	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMnbIeVAkuRX2h64TiQCpD8gov5ckKA0yf1G7j	BafdMI4pfuXMnbIeVAkuRX2h64TiQCpD8gov5ckKA0yf1G7j	f	5	2026-04-21 14:21:53.027
266	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM5BYJBGnQbG4Po6plLWRDYN3sUji1B0AwFrVx	BafdMI4pfuXM5BYJBGnQbG4Po6plLWRDYN3sUji1B0AwFrVx	f	6	2026-04-21 14:21:53.027
267	71	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMCtIQtBIAFkAeYUXP6uWmQwR0KbjfOVgxJH3d	BafdMI4pfuXMCtIQtBIAFkAeYUXP6uWmQwR0KbjfOVgxJH3d	f	7	2026-04-21 14:21:53.027
305	88	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM4fvzrPWYatnIsmROMj8prqWlXDKVoEeH3ic7	BafdMI4pfuXM4fvzrPWYatnIsmROMj8prqWlXDKVoEeH3ic7	t	0	2026-04-21 16:12:30.187
304	87	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM3hKI0AJReEFRBSObsjYm8rPQthMTnKvZcXHd	BafdMI4pfuXM3hKI0AJReEFRBSObsjYm8rPQthMTnKvZcXHd	t	0	2026-04-21 16:01:47.012
306	89	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM9fmoc5CFa2x1qtdOkJgXUop4S6jAY0fwHliI	BafdMI4pfuXM9fmoc5CFa2x1qtdOkJgXUop4S6jAY0fwHliI	t	0	2026-04-21 16:16:25.907
307	89	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMYjvvWDmL8465v3bphG1RidSjW7eV9OIX2gkM	BafdMI4pfuXMYjvvWDmL8465v3bphG1RidSjW7eV9OIX2gkM	f	1	2026-04-21 16:16:25.907
272	73	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMLKn5OBf2H7lcNxRmOIM9Psu5w1VXCj0bWqFA	BafdMI4pfuXMLKn5OBf2H7lcNxRmOIM9Psu5w1VXCj0bWqFA	t	0	2026-04-21 14:34:25.648
273	73	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMaj4fxJ3c1Welri7qHg5aUB4wn89JvPR2pYzX	BafdMI4pfuXMaj4fxJ3c1Welri7qHg5aUB4wn89JvPR2pYzX	f	1	2026-04-21 14:34:25.648
310	91	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMS020ccKUXprwg8WE35e4jbKsCxkT1NYIcaLS	BafdMI4pfuXMS020ccKUXprwg8WE35e4jbKsCxkT1NYIcaLS	t	0	2026-04-22 11:39:06.731
311	91	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMYZ4I2pL8465v3bphG1RidSjW7eV9OIX2gkME	BafdMI4pfuXMYZ4I2pL8465v3bphG1RidSjW7eV9OIX2gkME	f	1	2026-04-22 11:39:06.731
312	92	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMGTdlosgye9hxqfP7ZJKEQ0Nu5n2UszpbXrjR	BafdMI4pfuXMGTdlosgye9hxqfP7ZJKEQ0Nu5n2UszpbXrjR	t	0	2026-04-22 13:17:20.123
313	93	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMUlBYdbEoyekMJIgiDchuABvtNP3G2Rf5q61H	BafdMI4pfuXMUlBYdbEoyekMJIgiDchuABvtNP3G2Rf5q61H	t	0	2026-04-22 13:38:07.477
314	94	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMJ9kJNzfZSDqs5zbW62h7BRrlpxIE8vGVTuQ0	BafdMI4pfuXMJ9kJNzfZSDqs5zbW62h7BRrlpxIE8vGVTuQ0	t	0	2026-04-22 14:03:32.93
315	95	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMhM0RvHu01OHS59gQvloLpeMjIByUmzFxCEX2	BafdMI4pfuXMhM0RvHu01OHS59gQvloLpeMjIByUmzFxCEX2	t	0	2026-04-22 14:33:09.931
281	76	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMaCEjGn3c1Welri7qHg5aUB4wn89JvPR2pYzX	BafdMI4pfuXMaCEjGn3c1Welri7qHg5aUB4wn89JvPR2pYzX	t	0	2026-04-21 14:50:52.851
282	76	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMwhBNc8OphiFV67RCQa8wtHZTXqkx25yIouPz	BafdMI4pfuXMwhBNc8OphiFV67RCQa8wtHZTXqkx25yIouPz	f	1	2026-04-21 14:50:52.851
316	96	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXModzMdvoIA31WReD8gLkS6OPjE0Cho2MFHdc7	BafdMI4pfuXModzMdvoIA31WReD8gLkS6OPjE0Cho2MFHdc7	t	0	2026-04-22 14:43:21.466
317	96	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXM87DOpeFOBnMZU0sei9k2wqlVrJA5H6NaQjgb	BafdMI4pfuXM87DOpeFOBnMZU0sei9k2wqlVrJA5H6NaQjgb	f	1	2026-04-22 14:43:21.466
318	97	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMBg0EbX4pfuXMZj9QDoUsl0eYNzCEq1n8dJVF	BafdMI4pfuXMBg0EbX4pfuXMZj9QDoUsl0eYNzCEq1n8dJVF	t	0	2026-04-22 15:15:39.025
300	84	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMDzEoAuGMadGChmTSWVLqtFJRQ5n8upP0brvN	BafdMI4pfuXMDzEoAuGMadGChmTSWVLqtFJRQ5n8upP0brvN	t	0	2026-04-21 15:37:33.123
301	84	\N	https://jbg584dxw1.ufs.sh/f/BafdMI4pfuXMd9HRoDmDnoqgj28zVZtUh4SGAH13dXi9bfME	BafdMI4pfuXMd9HRoDmDnoqgj28zVZtUh4SGAH13dXi9bfME	f	1	2026-04-21 15:37:33.123
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e906611e-b326-4d52-bce4-8ba30318b669	2ba785102de856ec71753bcd7da46b13767afb780d436b88d37e86c296ee9b12	2026-04-17 10:07:44.08302+00	20260313101336_buy_supply	\N	\N	2026-04-17 10:07:38.313246+00	1
2b75256a-394f-4f35-bce8-89e1d23bbe20	7f521f0f896eb4af100d85347d6860d5db4483668f2081d51b9717063684c24b	2026-04-17 10:07:56.214823+00	20260319103443_add_categories	\N	\N	2026-04-17 10:07:52.692359+00	1
a9feec30-cd34-4a4f-aa05-7693418d71c4	f44e4a985db98ba1b252db474fe52e8679537be6352d163cc8cfb098104a4dee	2026-04-17 10:09:31.808183+00	20260417100920_add_image_order	\N	\N	2026-04-17 10:09:22.089876+00	1
a0edaf38-e576-4bb3-bcac-4691ea9db874	cc4cb3cd32abf7354dde019f1db25051375100ffa183f41696a5f11a6a4f58b0	2026-04-17 10:18:47.284688+00	20260417101845_add_image_order_index	\N	\N	2026-04-17 10:18:46.156668+00	1
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."Category_id_seq"', 2, true);


--
-- Name: ProductImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."ProductImage_id_seq"', 318, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."Product_id_seq"', 97, true);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: ProductImage_productId_order_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductImage_productId_order_idx" ON public."ProductImage" USING btree ("productId", "order");


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: ProductImage ProductImage_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA pgrst; Type: ACL; Schema: -; Owner: neon_service
--

GRANT USAGE ON SCHEMA pgrst TO authenticator;


--
-- Name: FUNCTION pre_config(); Type: ACL; Schema: pgrst; Owner: neon_service
--

GRANT ALL ON FUNCTION pgrst.pre_config() TO authenticator;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict PeNB1k5WVOvOkBHxDqZEa3frnk0WsXXftxxVS9GbKsSg1tdNjBry86DR8scUvnG

