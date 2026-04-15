import { useNavigate } from 'react-router-dom';
import { Table } from '../../../components'
import { QuestionRecords } from '../../../models'

import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestionDetail, fetchAllQuestions, deleteExistingQuestion } from '../questionSlice';
import { useEffect, useState } from 'react'; // Added useState

const questionRecordsCols: { id: string; label: string; minWidth?: number; hidden?: boolean }[] = [
    { id: 'id', label: 'ID', hidden: true },
    { id: 'title', label: 'Title', minWidth: 100 }, 
    { id: 'topic_tags', label: 'Topic', minWidth: 150 },
    { id: 'difficulty', label: 'Difficulty', minWidth: 100 },
];

export function QuestionRecordsTable() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 1. Local state for page management
    const [page, setPage] = useState(1);
    const limit = 10;

    const questions = useSelector((state: any) => state.question.list as QuestionRecords[]);
    const status = useSelector((state: any) => state.question.stateStatus);
    
    // 2. Extract pagination metadata from Redux
    const { totalPages } = useSelector((state: any) => state.question.pagination || { totalPages: 1 });

    // 3. Update useEffect to trigger on page change
    useEffect(() => {
        dispatch(fetchAllQuestions({ username: "admin_user", page, limit })); 
    }, [dispatch, page]);

    const handleViewClick = (x:string) => {
        dispatch(fetchQuestionDetail(x))
        navigate(`/question/view/${x}`);
    };

    const handleEditClick = (x:string) => {
        dispatch(fetchQuestionDetail(x))
        navigate(`/question/edit/${x}`);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm("Are you sure?")) {
            const resultAction = await dispatch(deleteExistingQuestion(id));
            if (deleteExistingQuestion.fulfilled.match(resultAction)) {
                // Stay on current page when refreshing after delete
                dispatch(fetchAllQuestions({ username: "admin_user", page, limit }));
            } else {
                alert("Delete failed: " + resultAction.payload);
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Table
                columns={questionRecordsCols}
                rows={questions || []}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* 4. Pagination Controls */}
            <div className="flex justify-center items-center gap-4 py-4">
                <button
                    disabled={page === 1 || status === 'loading'}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Previous
                </button>
                
                <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page >= totalPages || status === 'loading'}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Next
                </button>
            </div>
        </div>
    );
}