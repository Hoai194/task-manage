export default function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination-wrap" aria-label="Task pagination">
      <button className="btn btn-outline-dark" disabled={page === 1} type="button" onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button className="btn btn-outline-dark" disabled={page === totalPages} type="button" onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
