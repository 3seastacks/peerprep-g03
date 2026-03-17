import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import { Header, PageTitle, Button, DropDown, TextArea, TextField, ErrorMessage, convertEnumsToDropDownOption } from '../../../components';
import { getBlankFieldError } from '../../../commons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestionDetail, reset, createNewQuestion, updateExistingQuestion } from '../../../features/Admin/questionSlice'; // Added thunks
import LoadingPages from '../../SupportPages/LoadingPages/LoadingPages.tsx';
import { QuestionTopic, QuestionDifficulty } from '../../../models';

export default function QuestionForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { questionId } = useParams(); // Get ID from URL to check if Editing

    const { value, stateStatus, serverError } = useSelector((state: any) => state.question);
    const [formData, setFormData] = useState({
        questionTitle: '',
        questionTopic: [] as string[],
        questionDifficulty: '',
        question: '',
        solution: ''
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const isEditMode = Boolean(questionId); // Helper to determine mode

    const [hasTouched, setHasTouched] = useState({
        questionTitle: false,
        questionTopic: false,
        questionDifficulty: false,
        question: false,
        solution: false
    });

    const isFormIncomplete = !formData.questionDifficulty
        || !formData.question
        || !formData.solution
        || !formData.questionTitle
        || formData.questionTopic.length === 0;

    // Effect to fetch data if we are in Edit mode
    useEffect(() => {
        if (isEditMode && !isLoaded) {
            dispatch(fetchQuestionDetail(questionId));
        } else if (!isEditMode) {
            // If New mode, ensure form is empty
            setIsLoaded(true);
        }
    }, [dispatch, isEditMode, questionId, isLoaded]);

    // Effect to populate form once data is fetched successfully [cite: 87, 105]
    useEffect(() => {
    if (isEditMode && value && stateStatus === 'succeeded' && !isLoaded) {
        setFormData({
            // value.title is what the DB returns, questionTitle is what the form uses
            questionTitle: value.title || '', 
            questionTopic: Array.isArray(value.topic_tags) ? value.topic_tags : [],
            questionDifficulty: value.difficulty || '',
            question: value.description || '', // mapped from 'description' in DB
            solution: value.solution || ''
        });
        setIsLoaded(true);
    }
}, [value, stateStatus, isLoaded, isEditMode]);
    const handleSubmitClick = async () => {
    const payload = {
        id: questionId, // Ensure ID is inside the object for the thunk
        questionTitle: formData.questionTitle,
        questionTopic: formData.questionTopic,
        questionDifficulty: formData.questionDifficulty,
        question: formData.question,
        solution: formData.solution
    };

    let result;
    if (isEditMode) {
        result = await dispatch(updateExistingQuestion(payload));
    } else {
        result = await dispatch(createNewQuestion(payload));
    }

    // Only move if there's no duplicate error
    if (updateExistingQuestion.fulfilled.match(result) || createNewQuestion.fulfilled.match(result)) {
        dispatch(reset());
        navigate('/question/');
    }
    };
    const allErrorMessage = useMemo(() => {
        let msg = "";
        if (hasTouched.questionDifficulty) msg += getBlankFieldError("Question difficulty", formData.questionDifficulty);
        if (hasTouched.questionTopic && formData.questionTopic.length === 0) msg += "Please select at least one topic. ";
        if (hasTouched.questionTitle) msg += getBlankFieldError("Question title", formData.questionTitle);
        if (hasTouched.question) msg += getBlankFieldError("Question", formData.question);
        if (hasTouched.solution) msg += getBlankFieldError("Solution", formData.solution);
        if (serverError) {
            msg += (msg ? " | " : "") + "Duplicate title. Please choose other title.";
        }
        return msg;
    }, [formData, hasTouched, serverError]);

    // Show loading only if we are actively fetching for an Edit mode 
    if (isEditMode && (stateStatus === 'loading' || !value || !isLoaded)) {
        return <LoadingPages />;
    }

    const pageTitle = isEditMode ? "Edit Question" : "New Question"; 

    const handleBackClick = () => {
        dispatch(reset());
        navigate('/question/');
    };

    

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        setHasTouched(prev => ({ ...prev, [id]: true }));
        if (id === 'questionTitle' && serverError) {
            dispatch(reset()); // This clears state.serverError in Redux
        }
    };

    // Toggle handler for the checklist
    const handleTopicToggle = (topic: string) => {
        setFormData(prev => {
            const currentTopics = prev.questionTopic;
            const newTopics = currentTopics.includes(topic)
                ? currentTopics.filter(t => t !== topic)
                : [...currentTopics, topic];
            return { ...prev, questionTopic: newTopics };
        });
        setHasTouched(prev => ({ ...prev, questionTopic: true }));
    };
    return (
        <div>
            <Header />
            <div className="p-8">
                <PageTitle text={pageTitle} />
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    alignItems: 'start',
                    paddingLeft: '140px'
                }}>
                    <TextField
                        id="questionTitle"
                        label="Title"
                        value={formData.questionTitle}
                        onChange={(e) => handleChange('questionTitle', e.target.value)}
                    />
                    {/* TOPIC CHECKLIST START */}
                    <div className="flex flex-col">
                        <label className="text-sm font-bold mb-1">Question Topics</label>
                        <div className="border rounded-lg p-2 bg-white overflow-y-auto" style={{ height: '120px', width: '250px' }}>
                            {Object.values(QuestionTopic).map((topic) => (
                                <div key={topic} className="flex items-center gap-2 p-1 hover:bg-gray-50">
                                    <input 
                                        type="checkbox" 
                                        id={`topic-${topic}`}
                                        checked={formData.questionTopic.includes(topic)}
                                        onChange={() => handleTopicToggle(topic)}
                                    />
                                    <label htmlFor={`topic-${topic}`} className="text-sm cursor-pointer">{topic}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* TOPIC CHECKLIST END */}
                    
                    <DropDown
                        id="questionDifficulty"
                        label="Question Difficulty"
                        value={formData.questionDifficulty}
                        onChange={(e) => handleChange('questionDifficulty', e.target.value)}
                        items={convertEnumsToDropDownOption(QuestionDifficulty)} />
                </div>
                <div className="px-7">
                    <TextArea
                        id="question"
                        label="Question"
                        value={formData.question}
                        onChange={(e) => handleChange('question', e.target.value)}
                        rows={5} />
                    <TextArea
                        id="solution"
                        label="Solution"
                        value={formData.solution}
                        onChange={(e) => handleChange('solution', e.target.value)}
                        rows={5} />
                </div>
                <ErrorMessage text={allErrorMessage} />
                <div className="flex justify-center p-4 gap-x-15">
                    <Button label="Back" onClick={handleBackClick} />
                    <Button
                        label="Submit"
                        onClick={handleSubmitClick}
                        disabled={allErrorMessage !== "" || isFormIncomplete || stateStatus === 'loading'}
                    />
                </div>
            </div>
        </div>
    );
}