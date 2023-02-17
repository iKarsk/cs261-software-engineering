'use client';

import styles from './page.module.css'
import Link from 'next/link';


export default function Home() {

    const handleSubmit = async (event : any) => {
        event.preventDefault();

        const data = {
            email: event.target.email.value,
            password: event.target.password.value,
        };

        const JSONdata = JSON.stringify(data);

        const endpoint="/api/login";
/*
        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        };

        const response = await fetch(endpoint, options);

        const result = await response.json();
*/
    }





  return (
    <div className={styles.container}>  
        <form onSubmit = {handleSubmit}>
            <div id={styles.formBox}>
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
