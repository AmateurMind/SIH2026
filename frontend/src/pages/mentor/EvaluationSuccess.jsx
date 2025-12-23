import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const EvaluationSuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <Card className="text-center shadow-soft border-gray-100 rounded-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Evaluation Submitted!</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-8">
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Thank you for taking the time to evaluate the intern. Your feedback has been securely recorded and will be used to generate their Internship Performance Passport.
                        </p>
                        <div className="bg-blue-50 p-5 rounded-xl text-sm text-blue-800 text-left border border-blue-100">
                            <p className="font-bold mb-1">What happens next?</p>
                            <p className="text-blue-700/80">The student will now be notified to submit their project documentation, after which the faculty will review the complete portfolio.</p>
                        </div>
                    </CardContent>

                </Card>
            </div>
        </div>
    );
};

export default EvaluationSuccess;
