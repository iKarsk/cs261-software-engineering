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
