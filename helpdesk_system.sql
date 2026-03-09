--
-- PostgreSQL database dump
--



-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-02-19 13:45:57

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
-- TOC entry 8 (class 2615 OID 16391)
-- Name: admin; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA admin;


ALTER SCHEMA admin OWNER TO postgres;

--
-- TOC entry 6 (class 2615 OID 16389)
-- Name: employee; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA employee;


ALTER SCHEMA employee OWNER TO postgres;

--
-- TOC entry 7 (class 2615 OID 16390)
-- Name: it_team; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA it_team;


ALTER SCHEMA it_team OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 16482)
-- Name: audit_log; Type: TABLE; Schema: admin; Owner: postgres
--

CREATE TABLE admin.audit_log (
    log_id integer NOT NULL,
    action text,
    performed_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE admin.audit_log OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16481)
-- Name: audit_log_log_id_seq; Type: SEQUENCE; Schema: admin; Owner: postgres
--

CREATE SEQUENCE admin.audit_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE admin.audit_log_log_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 236
-- Name: audit_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: admin; Owner: postgres
--

ALTER SEQUENCE admin.audit_log_log_id_seq OWNED BY admin.audit_log.log_id;


--
-- TOC entry 235 (class 1259 OID 16474)
-- Name: sla_policy; Type: TABLE; Schema: admin; Owner: postgres
--

CREATE TABLE admin.sla_policy (
    sla_id integer NOT NULL,
    issue_type character varying(100),
    resolution_time_hours integer
);


ALTER TABLE admin.sla_policy OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16473)
-- Name: sla_policy_sla_id_seq; Type: SEQUENCE; Schema: admin; Owner: postgres
--

CREATE SEQUENCE admin.sla_policy_sla_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE admin.sla_policy_sla_id_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 234
-- Name: sla_policy_sla_id_seq; Type: SEQUENCE OWNED BY; Schema: admin; Owner: postgres
--

ALTER SEQUENCE admin.sla_policy_sla_id_seq OWNED BY admin.sla_policy.sla_id;


--
-- TOC entry 227 (class 1259 OID 16423)
-- Name: asset_request; Type: TABLE; Schema: employee; Owner: postgres
--

CREATE TABLE employee.asset_request (
    request_id integer NOT NULL,
    emp_id integer,
    asset_type character varying(100),
    reason text,
    status character varying(50) DEFAULT 'Pending'::character varying
);


ALTER TABLE employee.asset_request OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16422)
-- Name: asset_request_request_id_seq; Type: SEQUENCE; Schema: employee; Owner: postgres
--

CREATE SEQUENCE employee.asset_request_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE employee.asset_request_request_id_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 226
-- Name: asset_request_request_id_seq; Type: SEQUENCE OWNED BY; Schema: employee; Owner: postgres
--

ALTER SEQUENCE employee.asset_request_request_id_seq OWNED BY employee.asset_request.request_id;


--
-- TOC entry 223 (class 1259 OID 16393)
-- Name: employee_details; Type: TABLE; Schema: employee; Owner: postgres
--

CREATE TABLE employee.employee_details (
    emp_id integer NOT NULL,
    emp_name character varying(100),
    department character varying(50),
    email character varying(100),
    password text
);


ALTER TABLE employee.employee_details OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16392)
-- Name: employee_details_emp_id_seq; Type: SEQUENCE; Schema: employee; Owner: postgres
--

CREATE SEQUENCE employee.employee_details_emp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE employee.employee_details_emp_id_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 222
-- Name: employee_details_emp_id_seq; Type: SEQUENCE OWNED BY; Schema: employee; Owner: postgres
--

ALTER SEQUENCE employee.employee_details_emp_id_seq OWNED BY employee.employee_details.emp_id;


--
-- TOC entry 225 (class 1259 OID 16405)
-- Name: ticket; Type: TABLE; Schema: employee; Owner: postgres
--

CREATE TABLE employee.ticket (
    ticket_id integer NOT NULL,
    emp_id integer,
    issue_type character varying(100),
    description text,
    status character varying(50) DEFAULT 'Open'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE employee.ticket OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16404)
-- Name: ticket_ticket_id_seq; Type: SEQUENCE; Schema: employee; Owner: postgres
--

CREATE SEQUENCE employee.ticket_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE employee.ticket_ticket_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 224
-- Name: ticket_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: employee; Owner: postgres
--

ALTER SEQUENCE employee.ticket_ticket_id_seq OWNED BY employee.ticket.ticket_id;


--
-- TOC entry 233 (class 1259 OID 16461)
-- Name: asset_allocation; Type: TABLE; Schema: it_team; Owner: postgres
--

CREATE TABLE it_team.asset_allocation (
    allocation_id integer NOT NULL,
    request_id integer,
    asset_serial_no character varying(100),
    allocated_by integer
);


ALTER TABLE it_team.asset_allocation OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16460)
-- Name: asset_allocation_allocation_id_seq; Type: SEQUENCE; Schema: it_team; Owner: postgres
--

CREATE SEQUENCE it_team.asset_allocation_allocation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE it_team.asset_allocation_allocation_id_seq OWNER TO postgres;

--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 232
-- Name: asset_allocation_allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: it_team; Owner: postgres
--

ALTER SEQUENCE it_team.asset_allocation_allocation_id_seq OWNED BY it_team.asset_allocation.allocation_id;


--
-- TOC entry 229 (class 1259 OID 16439)
-- Name: staff; Type: TABLE; Schema: it_team; Owner: postgres
--

CREATE TABLE it_team.staff (
    it_id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    specialization character varying(100)
);


ALTER TABLE it_team.staff OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16438)
-- Name: staff_it_id_seq; Type: SEQUENCE; Schema: it_team; Owner: postgres
--

CREATE SEQUENCE it_team.staff_it_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE it_team.staff_it_id_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 228
-- Name: staff_it_id_seq; Type: SEQUENCE OWNED BY; Schema: it_team; Owner: postgres
--

ALTER SEQUENCE it_team.staff_it_id_seq OWNED BY it_team.staff.it_id;


--
-- TOC entry 231 (class 1259 OID 16447)
-- Name: ticket_assignment; Type: TABLE; Schema: it_team; Owner: postgres
--

CREATE TABLE it_team.ticket_assignment (
    assign_id integer NOT NULL,
    ticket_id integer,
    it_id integer,
    assigned_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resolution_status character varying(50)
);


ALTER TABLE it_team.ticket_assignment OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16446)
-- Name: ticket_assignment_assign_id_seq; Type: SEQUENCE; Schema: it_team; Owner: postgres
--

CREATE SEQUENCE it_team.ticket_assignment_assign_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE it_team.ticket_assignment_assign_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 230
-- Name: ticket_assignment_assign_id_seq; Type: SEQUENCE OWNED BY; Schema: it_team; Owner: postgres
--

ALTER SEQUENCE it_team.ticket_assignment_assign_id_seq OWNED BY it_team.ticket_assignment.assign_id;


--
-- TOC entry 4905 (class 2604 OID 16485)
-- Name: audit_log log_id; Type: DEFAULT; Schema: admin; Owner: postgres
--

ALTER TABLE ONLY admin.audit_log ALTER COLUMN log_id SET DEFAULT nextval('admin.audit_log_log_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 16477)
-- Name: sla_policy sla_id; Type: DEFAULT; Schema: admin; Owner: postgres
--

ALTER TABLE ONLY admin.sla_policy ALTER COLUMN sla_id SET DEFAULT nextval('admin.sla_policy_sla_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 16426)
-- Name: asset_request request_id; Type: DEFAULT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.asset_request ALTER COLUMN request_id SET DEFAULT nextval('employee.asset_request_request_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16396)
-- Name: employee_details emp_id; Type: DEFAULT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.employee_details ALTER COLUMN emp_id SET DEFAULT nextval('employee.employee_details_emp_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16408)
-- Name: ticket ticket_id; Type: DEFAULT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.ticket ALTER COLUMN ticket_id SET DEFAULT nextval('employee.ticket_ticket_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 16464)
-- Name: asset_allocation allocation_id; Type: DEFAULT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.asset_allocation ALTER COLUMN allocation_id SET DEFAULT nextval('it_team.asset_allocation_allocation_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 16442)
-- Name: staff it_id; Type: DEFAULT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.staff ALTER COLUMN it_id SET DEFAULT nextval('it_team.staff_it_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16450)
-- Name: ticket_assignment assign_id; Type: DEFAULT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.ticket_assignment ALTER COLUMN assign_id SET DEFAULT nextval('it_team.ticket_assignment_assign_id_seq'::regclass);


--
-- TOC entry 4924 (class 2606 OID 16491)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: admin; Owner: postgres
--

ALTER TABLE ONLY admin.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (log_id);


--
-- TOC entry 4922 (class 2606 OID 16480)
-- Name: sla_policy sla_policy_pkey; Type: CONSTRAINT; Schema: admin; Owner: postgres
--

ALTER TABLE ONLY admin.sla_policy
    ADD CONSTRAINT sla_policy_pkey PRIMARY KEY (sla_id);


--
-- TOC entry 4914 (class 2606 OID 16432)
-- Name: asset_request asset_request_pkey; Type: CONSTRAINT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.asset_request
    ADD CONSTRAINT asset_request_pkey PRIMARY KEY (request_id);


--
-- TOC entry 4908 (class 2606 OID 16403)
-- Name: employee_details employee_details_email_key; Type: CONSTRAINT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.employee_details
    ADD CONSTRAINT employee_details_email_key UNIQUE (email);


--
-- TOC entry 4910 (class 2606 OID 16401)
-- Name: employee_details employee_details_pkey; Type: CONSTRAINT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.employee_details
    ADD CONSTRAINT employee_details_pkey PRIMARY KEY (emp_id);


--
-- TOC entry 4912 (class 2606 OID 16415)
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id);


--
-- TOC entry 4920 (class 2606 OID 16467)
-- Name: asset_allocation asset_allocation_pkey; Type: CONSTRAINT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.asset_allocation
    ADD CONSTRAINT asset_allocation_pkey PRIMARY KEY (allocation_id);


--
-- TOC entry 4916 (class 2606 OID 16445)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (it_id);


--
-- TOC entry 4918 (class 2606 OID 16454)
-- Name: ticket_assignment ticket_assignment_pkey; Type: CONSTRAINT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.ticket_assignment
    ADD CONSTRAINT ticket_assignment_pkey PRIMARY KEY (assign_id);


--
-- TOC entry 4926 (class 2606 OID 16433)
-- Name: asset_request asset_request_emp_id_fkey; Type: FK CONSTRAINT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.asset_request
    ADD CONSTRAINT asset_request_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employee.employee_details(emp_id);


--
-- TOC entry 4925 (class 2606 OID 16416)
-- Name: ticket ticket_emp_id_fkey; Type: FK CONSTRAINT; Schema: employee; Owner: postgres
--

ALTER TABLE ONLY employee.ticket
    ADD CONSTRAINT ticket_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employee.employee_details(emp_id);


--
-- TOC entry 4928 (class 2606 OID 16468)
-- Name: asset_allocation asset_allocation_allocated_by_fkey; Type: FK CONSTRAINT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.asset_allocation
    ADD CONSTRAINT asset_allocation_allocated_by_fkey FOREIGN KEY (allocated_by) REFERENCES it_team.staff(it_id);


--
-- TOC entry 4927 (class 2606 OID 16455)
-- Name: ticket_assignment ticket_assignment_it_id_fkey; Type: FK CONSTRAINT; Schema: it_team; Owner: postgres
--

ALTER TABLE ONLY it_team.ticket_assignment
    ADD CONSTRAINT ticket_assignment_it_id_fkey FOREIGN KEY (it_id) REFERENCES it_team.staff(it_id);


-- Completed on 2026-02-19 13:45:58

--
-- PostgreSQL database dump complete
--



