import React from 'react'
import LoginForm from './_components/LoginForm';
import { Suspense } from 'react';

const page = () => {
    return (
        <div>
            <Suspense fallback="Loading...">
                <LoginForm />
            </Suspense>

        </div>
    )
}

export default page
