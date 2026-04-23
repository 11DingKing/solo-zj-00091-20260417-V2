import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import profileService from "../utils/profileService";

const initialState = {
  profile: null,
  agents: [],
  topAgents: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};

export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async (_, thunkAPI) => {
    try {
      return await profileService.getProfile();
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

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ username, profileData }, thunkAPI) => {
    try {
      return await profileService.updateProfile(username, profileData);
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

export const getAgents = createAsyncThunk(
  "profile/getAgents",
  async (_, thunkAPI) => {
    try {
      return await profileService.getAgents();
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

export const getTopAgents = createAsyncThunk(
  "profile/getTopAgents",
  async (_, thunkAPI) => {
    try {
      return await profileService.getTopAgents();
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

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAgents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.agents = action.payload;
      })
      .addCase(getAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTopAgents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTopAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.topAgents = action.payload;
      })
      .addCase(getTopAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = profileSlice.actions;

export default profileSlice.reducer;
