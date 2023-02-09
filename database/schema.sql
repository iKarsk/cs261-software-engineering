DROP TABLE project;
CREATE TABLE projects(
    id bigint PRIMARY KEY,
    name varchar(100),
    start_date timestamp,
    deadline timestamp,
    end_date timestamp,
    budget bigint,
    risk int,
    repository_link varchar(MAX)
);


DROP TABLE users;
CREATE TABLE users(
    id bigint PRIMARY KEY,
    forename varchar(100),
    surname varchar(100),
    email varchar(100),
    password varchar(100),
    years_experience int
);

DROP TABLE morale;
CREATE TABLE morale(
    project bigint PRIMARY KEY references projects (id),
    user bigint PRIMARY KEY references users (id),
    date timestamp PRIMARY KEY,
    morale int
);

DROP TABLE user_invites;
CREATE TABLE user_invites(
    project bigint PRIMARY KEY references projects (id),
    user bigint PRIMARY KEY references users (id)
);


DROP TABLE user_tasks;
CREATE TABLE user_tasks(
    task bigint PRIMARY KEY references project_tasks (id),
    user bigint PRIMARY KEY references users (id),

);

DROP TABLE project_developers;
CREATE TABLE project_developers(
    project bigint PRIMARY KEY references projects (id),
    user bigint PRIMARY KEY references users (id),
    isManager boolean 
);

DROP TABLE project_tasks;
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