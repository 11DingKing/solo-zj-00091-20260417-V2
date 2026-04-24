import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import propertyAPIService from "../utils/propertyAPIService";

const initialState = {
  properties: [],
  searchResults: [],
  property: {},
  isError: false,
  isLoading: false,
  isSuccess: false,
  isSearching: false,
  message: "",
};

export const getProperties = createAsyncThunk(
  "properties/getAll",
  async (_, thunkAPI) => {
    try {
      return await propertyAPIService.getProperties();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const searchProperties = createAsyncThunk(
  "properties/search",
  async (searchParams, thunkAPI) => {
    try {
      return await propertyAPIService.searchProperties(searchParams);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    reset: (state) => initialState,
    resetSearch: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProperties.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.properties = action.payload.results || action.payload;
      })
      .addCase(getProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(searchProperties.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.isSearching = false;
        state.isSuccess = true;
        state.searchResults = action.payload;
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.isSearching = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetSearch } = propertySlice.actions;
export default propertySlice.reducer;
