export type User = {
	id: number;
	forename: string;
	surname: string;
	email: string;
	password: string;
	yearsofexperience: number;
}

export type LoginInput = {
	email: string;
	password: string;
}

export type Project = {
	id: number;
	name: string;
	start_date: Date;
	deadline: Date;
	end_date: Date;
	budget: number;
	risk: number;
	repository_link: string;
}

export type Task = {
	id: number;
	project: number;
	name: string;
	description: string;
	start_date: Date;
	deadline: Date;
	end_date: Date;
	progress: string;
	risk: number;
}
