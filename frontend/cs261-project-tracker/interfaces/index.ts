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

export type ProjectInput = {
	u_id: number;
	name: string;
	deadline: Date;
	budget: number;
	repository_link: string;
	categories: string[];
}

export type ProjectEdit = {
	project: number;
	name: string;
	deadline: Date;
	budget: number;
	repository_link: string;
	categories: string[];
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

export type UserTask = {
	task: number;
	userArr: number[];
}

export type Developer = {
	project: number;
	u_id: number;
	ismanager: boolean;
}

export type Invite = {
	project: number;
	email: string;
	ismanager: boolean;
}

export type Morale = {
	project: number;
	u_id: number;
	submit_date: Date;
	morale: number;
}

export type HandleInvite = {
	project: number;
	u_id: number;
	accept: boolean;
}
