DROP TABLE project CASCADE;
CREATE TABLE projects(
    id bigint PRIMARY KEY,
    name varchar(100),
    start_date timestamp,
    deadline timestamp,
    end_date timestamp,
    budget bigint,
    risk int,
    repository_link varchar()
);


DROP TABLE users CASCADE;
CREATE TABLE users(
    id bigint PRIMARY KEY,
    forename varchar(100),
    surname varchar(100),
    email varchar(100),
    password varchar(100),
    years_experience int
);

DROP TABLE morale CASCADE;
CREATE TABLE morale(
    project bigint references projects (id),
    u_id bigint references users (id),
    submit_date timestamp,
    morale int,
    PRIMARY KEY (project, u_id, submit_date, morale)
);

DROP TABLE user_invites CASCADE;
CREATE TABLE user_invites(
    project bigint references projects (id),
    u_id bigint references users (id),
    PRIMARY KEY (project, u_id)
);


DROP TABLE user_tasks CASCADE;
CREATE TABLE user_tasks(
    task bigint references project_tasks (id),
    u_id bigint references users (id),
    PRIMARY KEY (task, u_id)
);

DROP TABLE project_developers CASCADE;
CREATE TABLE project_developers(
    project bigint references projects (id),
    u_id bigint references users (id),
    isManager boolean,
    PRIMARY KEY (project, u_id)
);

DROP TABLE project_tasks CASCADE;
CREATE TABLE project_tasks(
    id bigint PRIMARY KEY,
    project bigint references projects (id),
    name varchar(100),
    description varchar(1000),
    start_date timestamp,
    deadline timestamp,
    end_date timestamp,
    progress varchar(100),
    risk int
);
