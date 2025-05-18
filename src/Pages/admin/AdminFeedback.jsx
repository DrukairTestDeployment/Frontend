import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../Css/adminfeed.css";
import feedbackData from './feedback.json';
import { MdAdd } from 'react-icons/md';
import Swal from 'sweetalert2';

const FeedbackAdmin = () => {
    const [allQuestions, setAllQuestions] = useState(feedbackData.questions);
    const [questions, setQuestions] = useState(allQuestions);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        questionEnglish: "",
        questionDzongkha: "",
        options: [{ id: 1, value: "" }],
    });

    // Filter questions based on search term
    useEffect(() => {
        const filteredQuestions = allQuestions.filter((question) => {
            const english = question.questionEnglish?.toLowerCase() || '';
            const dzongkha = question.questionDzongkha?.toLowerCase() || '';
            return english.includes(searchTerm.toLowerCase()) || dzongkha.includes(searchTerm.toLowerCase());
        });
        setQuestions(filteredQuestions);
        setCurrentPage(1);
    }, [searchTerm, allQuestions]);


    // Pagination logic
    const indexOfLastQuestion = currentPage * itemsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
    const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
    const totalPages = Math.ceil(questions.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddQuestion = () => {
        setShowAddForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewQuestion({ ...newQuestion, [name]: value });
    };

    const handleOptionChange = (id, value, isDzongkha = false) => {
        setNewQuestion(prev => ({
            ...prev,
            options: prev.options.map(option =>
                option.id === id ? {
                    ...option,
                    value: isDzongkha ? option.value : value, // Update English value
                    dzongkhaValue: isDzongkha ? value : option.dzongkhaValue // Update Dzongkha value
                } : option
            )
        }));
    };


    const addOption = () => {
        const newOption = { id: newQuestion.options.length + 1, value: "" };
        setNewQuestion({ ...newQuestion, options: [...newQuestion.options, newOption] });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Confirm Add Question",
            text: "Are you sure you want to add this question?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1E306D",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, add question"
        }).then((result) => {
            if (result.isConfirmed) {
                setAllQuestions([...allQuestions, { ...newQuestion, id: allQuestions.length + 1 }]);
                setShowAddForm(false);
                setNewQuestion({
                    questionEnglish: "",
                    questionDzongkha: "",
                    options: [{ id: 1, value: "" }],
                });

                Swal.fire("Success", "Question added successfully", "success");
            }
        });
    };

    const handleDeleteQuestion = (id) => {
        Swal.fire({
            title: "Confirm Delete Question",
            text: "Are you sure you want to delete this question?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1E306D",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedQuestions = allQuestions.filter((question) => question.id !== id);
                setAllQuestions(updatedQuestions);
                setQuestions(updatedQuestions); // Ensure the questions displayed are updated
                Swal.fire("Deleted!", "The question has been deleted.", "success");
            }
        });
    };
    

    const closeModal = () => {
        setShowAddForm(false);
    };

    return (
        <main className="feedback-admin-container">
            <div className="feedback-table-container">
                <h2 className="feedback-table-title">Feedback Questions</h2>

                <div className="feedback-table-controls">
                    <div className="feedback-left-controls">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="feedback-search-bar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="feedback-right-controls">
                        <button className="feedback-add-button" onClick={handleAddQuestion}>
                            Add Question <MdAdd style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </div>

                {/* Modal for adding question */}
                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <span className="modal-close-button" onClick={closeModal}>
                                &times;
                            </span>
                            <h3>Add Feedback Question</h3>

                            <form className="feedback-form" onSubmit={handleFormSubmit}>
                                {/* First Two Questions Stacked Vertically */}
                                <div className="form-group">
                                    <label>Question (English)</label>
                                    <input
                                        type="text"
                                        name="questionEnglish"
                                        value={newQuestion.questionEnglish}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Question (Dzongkha)</label>
                                    <input
                                        type="text"
                                        name="questionDzongkha"
                                        value={newQuestion.questionDzongkha}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                {/* Options in Two Columns */}
                                <div className="options-container">
                                    <div className="options-column">
                                        <h4>Options (English)</h4>
                                        {Array.isArray(newQuestion.options) && newQuestion.options.map(option => (
                                            <div className="form-group" key={option.id}>
                                                <label>Option {option.id}</label>
                                                <input
                                                    type="text"
                                                    value={option.value}
                                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="options-column">
                                        <h4>Options (Dzongkha)</h4>
                                        {Array.isArray(newQuestion.options) && newQuestion.options.map(option => (
                                            <div className="form-group" key={option.id + '_dzongkha'}>
                                                <label>Option {option.id}</label>
                                                <input
                                                    type="text"
                                                    value={option.dzongkhaValue}  // Manage Dzongkha value separately
                                                    onChange={(e) => handleOptionChange(option.id, e.target.value, true)} // Assume `true` indicates Dzongkha
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Button to add more options */}
                                <button type="button" className="feedback-submit-button" onClick={addOption}>
                                    Add Option
                                </button>

                                <button type="submit" className="feedback-submit-button">
                                    Add
                                </button>
                            </form>
                            <hr className="divider" />
                        </div>
                    </div>

                )}

                <table className="feedback-table">
                    <thead>
                        <tr>
                            <th>Sl. No</th>
                            <th>Questions</th>
                            <th>Rating</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentQuestions.map((question, index) => (
                            <tr key={question.id}>
                                <td>{indexOfFirstQuestion + index + 1}</td>
                                <td>{question.questionEnglish} / {question.questionDzongkha}</td> {/* Assuming you want to show both questions */}
                                <td>{question.rating}</td>
                                <td className="admin-action-icons">
                                    <button className="admin-delete-button" onClick={() => handleDeleteQuestion(question.id)}>
                                        <FiXCircle size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

                {totalPages > 1 && (
                    <div className="feedback-pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            {"<"}
                        </button>
                        {[...Array(totalPages)].map((_, pageIndex) => (
                            <button
                                key={pageIndex + 1}
                                onClick={() => handlePageChange(pageIndex + 1)}
                                className={currentPage === pageIndex + 1 ? "active-page" : ""}
                            >
                                {pageIndex + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            {">"}
                        </button>
                    </div>
                )}

                <p className="feedback-results-count">{questions.length} Results</p>
            </div>
        </main>
    );
};

export default FeedbackAdmin;
