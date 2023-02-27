'use client';

import styles from './page.module.css'
import Link from 'next/link';


export default function Home() {

    const handleSubmit = async (event : any) => {
        event.preventDefault();

        const data = {
            forename: event.target.forename.value,
            surname: event.target.surname.value,
            yearsofexperience: 5,
            email: event.target.email.value,
            password: event.target.password.value,
        };

        const JSONdata = JSON.stringify(data);

        const endpoint="/api/user/signup";

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };

        console.log("You are here");

        const response = await fetch(endpoint, options);

        const result = await response.json();
	    console.log(result);
    }





  return (
    <div className={styles.container}>  
        <form onSubmit = {handleSubmit}>
            <div id={styles.formBox}>
                <label htmlFor="forename">Forename</label>
                <input className={styles.input} type="text" id="forename" name="forename" required/>

                <label htmlFor="surname">Surname</label>
                <input className={styles.input} type="text" id="surname" name="surname" required/>

                <label htmlFor="experience">Years of Experience</label>
                <input className={styles.input} type="number" id="experience" name="experience" required/>

                <label htmlFor="email">Email</label>
                <input className={styles.input} type="email" id="email" name="email" required/>

                <label htmlFor="password">Password</label>
                <input className={styles.input} type="password" id="password" name="password" required/>

                <button type="submit">Submit</button>
            </div>
        </form>
        
    </div>
  )
}
