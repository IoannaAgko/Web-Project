CREATE DATABASE covid19;
CREATE EXTENSION postgis;

CREATE TABLE public."_lu_user_roles" (
	urid int2 NOT NULL,
	description varchar(32) NULL,
	CONSTRAINT "_lu_user_roles_pk" PRIMARY KEY (urid)
);

INSERT INTO public."_lu_user_roles" (urid,description) VALUES
	 (1,'ΔΙΑΧΕΙΡΙΣΤΗΣ'),
	 (2,'ΧΡΗΣΤΗΣ');

CREATE TABLE public."_users" (
	uid serial NOT NULL,
	username varchar(32) NOT NULL,
	pass varchar(254) NOT NULL,
	createdate timestamp(0) NOT NULL,
    email varchar(254) NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (uid),
    CONSTRAINT unique_username UNIQUE (username)
);
CREATE INDEX "_users_username_IDX" ON public._users USING btree (username);


CREATE TABLE public."_user_roles" (
	uid int4 NOT NULL,
	urid int2 NOT NULL,
	CONSTRAINT "_user_roles_pk" PRIMARY KEY (uid, urid),
    CONSTRAINT "_user_roles_FK" FOREIGN KEY (urid) REFERENCES _lu_user_roles(urid) ON UPDATE RESTRICT ON DELETE RESTRICT,   
    CONSTRAINT "_user_roles_FK_1" FOREIGN KEY (uid) REFERENCES _users(uid) ON UPDATE RESTRICT ON DELETE RESTRICT	 


);
CREATE INDEX "_user_roles_uid_IDX" ON public._user_roles USING btree (uid);
CREATE INDEX "_user_roles_urid_IDX" ON public._user_roles USING btree (urid);

CREATE TABLE public."pois" (
    pid varchar(255) NOT NULL,
    name varchar(254) NOT NULL,
    address varchar(254),
    createdate timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    point geometry(POINT, 4326) NOT NULL,
    CONSTRAINT "pois_pk" PRIMARY KEY (pid)
);

CREATE TABLE public."_lu_days" (
    did int2 NOT NULL,
    description varchar(32) NULL,
    CONSTRAINT "_lu_days_pk" PRIMARY KEY (did)
);
INSERT INTO public."_lu_days" (did,description) VALUES
	 (1,'ΔΕΥΤΕΡΑ'),
	 (2,'ΤΡΙΤΗ'),
     (3,'ΤΕΤΑΡΤΗ'),
	 (4,'ΠΕΜΠΤΗ'),
     (5,'ΠΑΡΑΣΚΕΥΗ'),
	 (6,'ΣΑΒΒΑΤΟ'),
     (7,'ΚΥΡΙΑΚΗ');

CREATE TABLE public."pois_populartimes" (
    ptid serial NOT NULL,
    pid varchar(255) NOT NULL,
    did int2 NOT NULL,
    "00:00" int2 NOT NULL,
    "01:00" int2 NOT NULL,
    "02:00" int2 NOT NULL,
    "03:00" int2 NOT NULL,
    "04:00" int2 NOT NULL,
    "05:00" int2 NOT NULL,
    "06:00" int2 NOT NULL,
    "07:00" int2 NOT NULL,
    "08:00" int2 NOT NULL,
    "09:00" int2 NOT NULL,
    "10:00" int2 NOT NULL,
    "11:00" int2 NOT NULL,
    "12:00" int2 NOT NULL,
    "13:00" int2 NOT NULL,
    "14:00" int2 NOT NULL,
    "15:00" int2 NOT NULL,
    "16:00" int2 NOT NULL,
    "17:00" int2 NOT NULL,
    "18:00" int2 NOT NULL,
    "19:00" int2 NOT NULL,
    "20:00" int2 NOT NULL,
    "21:00" int2 NOT NULL,
    "22:00" int2 NOT NULL,
    "23:00" int2 NOT NULL,
    UNIQUE (pid,did),
    CONSTRAINT "pois_populartimes_pk" PRIMARY KEY (ptid),
    CONSTRAINT "pois_populartimes_fk1" FOREIGN KEY (pid) REFERENCES pois(pid) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT "pois_populartimes_fk2" FOREIGN KEY (did) REFERENCES _lu_days(did) ON UPDATE RESTRICT ON DELETE RESTRICT 
);
CREATE INDEX "pois_populartimes_pid_IDX" ON public.pois_populartimes USING btree (pid);
CREATE INDEX "pois_populartimes_did_IDX" ON public.pois_populartimes USING btree (did);

CREATE TABLE public."visits" (
    vid serial NOT NULL,
    pid varchar(255) NOT NULL,
    uid INT NOT NULL,
    estimation INT,
    createdate timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visits_pk" PRIMARY KEY (vid),
    CONSTRAINT "visits_fk1" FOREIGN KEY (pid) REFERENCES pois(pid) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT "visits_fk2" FOREIGN KEY (uid) REFERENCES _users(uid) ON UPDATE RESTRICT ON DELETE CASCADE
);
CREATE INDEX "visits_pid_IDX" ON public.visits USING btree (pid);
CREATE INDEX "visits_uid_IDX" ON public.visits USING btree (uid);

CREATE TABLE public."covid_case" (
    cid serial NOT NULL,
    uid INT NOT NULL,
    createdate timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "covid_case_pk" PRIMARY KEY (cid),
	CONSTRAINT "covid_case_fk" FOREIGN KEY (uid) REFERENCES _users(uid) ON UPDATE RESTRICT ON DELETE CASCADE
);
CREATE INDEX "covid_case_uid_IDX" ON public."covid_case" USING btree (uid)