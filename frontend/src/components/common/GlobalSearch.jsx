import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { projectsApi } from "../../api/projectsApi";
import { messagesApi } from "../../api/messagesApi";
import { ROUTES } from "../../constants/routes";

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const { recent, addSearch, clearSearches } = useRecentSearches();
  
  const inputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      setQuery("");
      setActiveIndex(-1);
    }
  }, [open]);

  // Reset active index when search results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  const isSearchValid = debouncedQuery.trim().length >= 2;

  // Search Queries
  const { data: projectsData, isFetching: fetchingProjects } = useQuery({
    queryKey: ["globalSearch", "projects", debouncedQuery],
    queryFn: () => projectsApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isSearchValid && open,
    staleTime: 60_000,
  });

  const { data: messagesData, isFetching: fetchingMessages } = useQuery({
    queryKey: ["globalSearch", "messages", debouncedQuery],
    queryFn: () => messagesApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isSearchValid && open,
    staleTime: 60_000,
  });

  const isFetching = fetchingProjects || fetchingMessages;
  
  // Build flattened list of results for keyboard navigation
  const results = useMemo(() => {
    const list = [];
    
    if (!isSearchValid) {
      recent.forEach((term, idx) => {
        list.push({
          type: "recent",
          id: `recent-${idx}`,
          title: term,
          onClick: () => {
            setQuery(term);
          }
        });
      });
      return list;
    }

    const projects = projectsData?.projects || [];
    const messages = messagesData?.messages || [];

    projects.forEach(p => {
      list.push({
        type: "project",
        id: `project-${p._id}`,
        title: p.title,
        subtitle: p.category?.name || "Uncategorized",
        icon: <WorkOutlineIcon fontSize="small" />,
        onClick: () => {
          addSearch(debouncedQuery);
          onClose();
          navigate(`${ROUTES.adminProjects}?search=${encodeURIComponent(p.title)}`);
        }
      });
    });

    messages.forEach(m => {
      list.push({
        type: "message",
        id: `message-${m._id}`,
        title: m.fullname,
        subtitle: m.email,
        icon: <MailOutlineIcon fontSize="small" />,
        onClick: () => {
          addSearch(debouncedQuery);
          onClose();
          navigate(`${ROUTES.adminMessages}?open=${m._id}`);
        }
      });
    });

    return list;
  }, [isSearchValid, recent, projectsData, messagesData, debouncedQuery, addSearch, onClose, navigate]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      results[activeIndex].onClick();
    }
  };

  const activeId = activeIndex >= 0 ? results[activeIndex]?.id : undefined;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      aria-labelledby="global-search-title"
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
          overflow: "hidden",
          alignSelf: "flex-start", // align dialog to top
          mt: { xs: 4, sm: 10 },   // instead of center
          mb: 0
        }
      }}
    >
      <DialogTitle id="global-search-title" sx={{ position: "absolute", width: 1, height: 1, p: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        Search projects and messages
      </DialogTitle>
      <Box 
        sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <SearchIcon color="action" sx={{ mr: 1.5 }} />
        <InputBase
          inputRef={inputRef}
          placeholder="Search projects or messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, fontSize: "1.1rem" }}
          inputProps={{
            "aria-label": "Search projects and messages",
            role: "combobox",
            "aria-autocomplete": "list",
            "aria-expanded": open,
            "aria-controls": "global-search-listbox",
            "aria-activedescendant": activeId
          }}
        />
        {isFetching ? (
          <CircularProgress size={20} color="inherit" aria-label="Searching" sx={{ ml: 1 }} />
        ) : query ? (
          <IconButton size="small" onClick={() => setQuery("")} aria-label="Clear search" sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box sx={{ ml: 1, display: "flex", gap: 0.5 }}>
            <Box component="kbd" sx={{ px: 0.8, py: 0.3, border: '1px solid', borderColor: 'divider', borderRadius: 1, fontSize: '0.7rem', color: 'text.secondary' }}>esc</Box>
          </Box>
        )}
      </Box>

      <DialogContent sx={{ p: 0, minHeight: 100, maxHeight: 400, overflowY: "auto" }}>
        {!isSearchValid && recent.length > 0 && (
          <Box sx={{ p: 1 }} role="group" aria-label="Recent Searches">
            <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>Recent Searches</Typography>
              <Button size="small" onClick={clearSearches} aria-label="Clear recent searches">
                Clear
              </Button>
            </Box>
            
            <Box id="global-search-listbox" role="listbox" aria-label="Recent searches">
              {results.map((item, idx) => (
                <ResultItem key={item.id} item={item} isActive={activeIndex === idx} onMouseEnter={() => setActiveIndex(idx)} icon={<HistoryIcon fontSize="small" />} />
              ))}
            </Box>
          </Box>
        )}

        {isSearchValid && (
          <Box sx={{ p: 1 }}>
            {!isFetching && results.length === 0 && (
              <Box id="global-search-listbox" role="listbox" aria-label="Search results" sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No results found for "{debouncedQuery}"</Typography>
              </Box>
            )}
            {isFetching && results.length === 0 && <Box id="global-search-listbox" role="listbox" aria-label="Search results" />}

            {results.length > 0 && (
              <Box id="global-search-listbox" role="listbox" aria-label="Search results">
                {(() => {
                  let currentType = "";
                  return results.map((item, idx) => {
                    const isNewGroup = item.type !== currentType;
                    currentType = item.type;
                    
                    return (
                      <Box key={item.id} role="group" aria-label={item.type === "project" ? "Projects" : "Messages"}>
                        {isNewGroup && (
                          <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ px: 2, py: 1, display: "block" }}>
                            {item.type === "project" ? "Projects" : "Messages"}
                          </Typography>
                        )}
                        <ResultItem 
                          item={item}
                          isActive={activeIndex === idx}
                          onMouseEnter={() => setActiveIndex(idx)}
                          icon={item.icon}
                        />
                      </Box>
                    );
                  });
                })()}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      {!isSearchValid && recent.length === 0 && <Box id="global-search-listbox" role="listbox" aria-label="Recent searches" />}
    </Dialog>
  );
}

function ResultItem({ item, isActive, onMouseEnter, icon }) {
  return (
    <Box
      id={item.id}
      role="option"
      aria-selected={isActive}
      onClick={item.onClick}
      onMouseEnter={onMouseEnter}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1.5,
        cursor: "pointer",
        borderRadius: 1,
        bgcolor: isActive ? "action.hover" : "transparent",
      }}
    >
      <Box sx={{ mr: 2, display: "flex", color: "text.secondary" }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {item.title}
        </Typography>
        {item.subtitle && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {item.subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
