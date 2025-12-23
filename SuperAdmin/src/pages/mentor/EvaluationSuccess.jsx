import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const EvaluationSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800 text-xl">Evaluation Submitted!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-gray-600">
                        Thank you for taking the time to evaluate the intern. Your feedback has been securely recorded and will be used to generate their Internship Performance Passport.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                        <p className="text-sm text-blue-700">
                            The student will now be notified to submit their project documentation, after which the faculty will review the complete portfolio.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => navigate('/mentor/dashboard')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Return to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EvaluationSuccess;