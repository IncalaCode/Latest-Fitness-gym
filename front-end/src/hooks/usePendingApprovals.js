import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../config/config";

const usePendingApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const options = await GET_HEADER({ isJson: true });
      
      const response = await axios.get(
        API_ENDPOINT_FUNCTION('/approvals'),
        options
      );
      
      setPendingApprovals(response.data.data);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load pending approvals", 
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const handleApprove = async (id) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      const options = await GET_HEADER();

      console.log(Object.fromEntries(options.headers))
      
      await axios.get(
        API_ENDPOINT_FUNCTION(`/approvals/${id}/approve`),
        options
      );

      setPendingApprovals(prev => prev.filter(user => user.id !== id));
      enqueueSnackbar("User approved successfully", { variant: "success" });
    } catch (error) {
      console.error("Error approving user:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to approve user", 
        { variant: "error" }
      );
    } finally {
      setProcessingIds(prev => prev.filter(processId => processId !== id));
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      const options = await GET_HEADER();
      
      await axios.get(
        API_ENDPOINT_FUNCTION(`/approvals/${id}/reject`),
        options
      );
      
      // Remove the rejected user from the list
      setPendingApprovals(prev => prev.filter(user => user.id !== id));
      enqueueSnackbar("User rejected successfully", { variant: "success" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to reject user", 
        { variant: "error" }
      );
    } finally {
      setProcessingIds(prev => prev.filter(processId => processId !== id));
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  return {
    pendingApprovals,
    loading,
    processingIds,
    handleApprove,
    handleReject,
    refreshApprovals: fetchPendingApprovals
  };
};

export default usePendingApprovals;