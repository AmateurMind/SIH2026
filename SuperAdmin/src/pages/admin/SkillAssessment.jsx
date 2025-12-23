import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft,
    Save,
    TrendingUp,
    Target,
    Award,
    BookOpen,
    Code,
    Users,
    MessageSquare,
    Lightbulb
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import StarRating from '../../components/ipp/StarRating';
import toast from 'react-hot-toast';
import axios from 'axios';

const SkillAssessment = () => {
    const { ippId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ipp, setIpp] = useState(null);

    // Skill categories with pre/post internship ratings
    const [skillAssessments, setSkillAssessments] = useState({
        technicalSkills: {
            programming: { pre: 0, post: 0, growth: 0 },
            frameworks: { pre: 0, post: 0, growth: 0 },
            tools: { pre: 0, post: 0, growth: 0 },
            databases: { pre: 0, post: 0, growth: 0 },
            versionControl: { pre: 0, post: 0, growth: 0 }
        },
        softSkills: {
            communication: { pre: 0, post: 0, growth: 0 },
            teamwork: { pre: 0, post: 0, growth: 0 },
            problemSolving: { pre: 0, post: 0, growth: 0 },
            timeManagement: { pre: 0, post: 0, growth: 0 },
            adaptability: { pre: 0, post: 0, growth: 0 }
        },
        domainKnowledge: {
            industryKnowledge: { pre: 0, post: 0, growth: 0 },
            businessAcumen: { pre: 0, post: 0, growth: 0 },
            projectManagement: { pre: 0, post: 0, growth: 0 },
            clientInteraction: { pre: 0, post: 0, growth: 0 }
        }
    });

    const [additionalNotes, setAdditionalNotes] = useState('');

    useEffect(() => {
        fetchIPPData();
    }, [ippId]);

    const fetchIPPData = async () => {
        try {
            const response = await axios.get(`/api/ipp/${ippId}`);
            if (response.data.success) {
                setIpp(response.data.data);

                // Load existing skill assessments if available
                if (response.data.data.skillAssessment) {
                    setSkillAssessments(response.data.data.skillAssessment);
                }
                if (response.data.data.skillAssessmentNotes) {
                    setAdditionalNotes(response.data.data.skillAssessmentNotes);
                }
            }
        } catch (error) {
            console.error('Error fetching IPP:', error);
            toast.error('Failed to load IPP data');
        } finally {
            setLoading(false);
        }
    };

    const updateSkillRating = (category, skill, type, value) => {
        setSkillAssessments(prev => {
            const updated = { ...prev };
            updated[category][skill][type] = value;

            // Calculate growth automatically
            const pre = updated[category][skill].pre;
            const post = updated[category][skill].post;
            updated[category][skill].growth = post - pre;

            return updated;
        });
    };

    const calculateCategoryAverage = (category) => {
        const skills = Object.values(skillAssessments[category]);
        const totalGrowth = skills.reduce((sum, skill) => sum + skill.growth, 0);
        return (totalGrowth / skills.length).toFixed(1);
    };

    const calculateOverallGrowth = () => {
        const allCategories = Object.keys(skillAssessments);
        const totalGrowth = allCategories.reduce((sum, category) => {
            return sum + parseFloat(calculateCategoryAverage(category));
        }, 0);
        return (totalGrowth / allCategories.length).toFixed(1);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const assessmentData = {
                skillAssessment: skillAssessments,
                skillAssessmentNotes: additionalNotes,
                skillGrowthScore: parseFloat(calculateOverallGrowth()),
                assessedBy: user.id,
                assessedAt: new Date()
            };

            await axios.put(`/api/ipp/${ippId}/skill-assessment`, assessmentData);
            toast.success('Skill assessment saved successfully!');
            navigate(`/admin/ipp/${ippId}/review`);
        } catch (error) {
            console.error('Error saving skill assessment:', error);
            toast.error('Failed to save skill assessment');
        } finally {
            setSaving(false);
        }
    };

    const getSkillIcon = (skillName) => {
        const icons = {
            programming: Code,
            communication: MessageSquare,
            industryKnowledge: BookOpen,
            teamwork: Users,
            problemSolving: Lightbulb
        };
        return icons[skillName] || Target;
    };

    const getGrowthColor = (growth) => {
        if (growth > 2) return 'text-green-600';
        if (growth > 0) return 'text-blue-600';
        if (growth < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(`/admin/ipp/${ippId}/review`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Review
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Skill Assessment</h1>
                        <p className="text-gray-600">Track skill development during internship</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{calculateOverallGrowth()}</div>
                    <div className="text-sm text-gray-600">Overall Growth</div>
                </div>
            </div>

            {/* Student Info Card */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">{ipp?.studentDetails?.name}</h2>
                            <p className="text-gray-600">{ipp?.internshipDetails?.role} at {ipp?.internshipDetails?.company}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">IPP ID: {ipp?.ippId}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(ipp?.internshipDetails?.startDate).toLocaleDateString()} -
                                {new Date(ipp?.internshipDetails?.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skill Assessment Sections */}
            {Object.entries(skillAssessments).map(([category, skills]) => (
                <Card key={category} className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 capitalize">
                            <Award className="h-5 w-5" />
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                            <span className="ml-auto text-lg font-normal text-blue-600">
                                Avg Growth: {calculateCategoryAverage(category)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(skills).map(([skillName, ratings]) => {
                                const IconComponent = getSkillIcon(skillName);
                                return (
                                    <div key={skillName} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <IconComponent className="h-4 w-4 text-blue-600" />
                                            <Label className="capitalize font-medium">
                                                {skillName.replace(/([A-Z])/g, ' $1').trim()}
                                            </Label>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs text-gray-600">Pre-Internship</Label>
                                                <StarRating
                                                    value={ratings.pre}
                                                    onChange={(value) => updateSkillRating(category, skillName, 'pre', value)}
                                                    size={16}
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs text-gray-600">Post-Internship</Label>
                                                <StarRating
                                                    value={ratings.post}
                                                    onChange={(value) => updateSkillRating(category, skillName, 'post', value)}
                                                    size={16}
                                                />
                                            </div>

                                            <div className="pt-2 border-t">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600">Growth</span>
                                                    <span className={`text-sm font-medium ${getGrowthColor(ratings.growth)}`}>
                                                        {ratings.growth > 0 ? '+' : ''}{ratings.growth}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Additional Notes */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                        placeholder="Add any additional observations about skill development, notable achievements, or areas for future focus..."
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate(`/admin/ipp/${ippId}/review`)}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Assessment
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default SkillAssessment;