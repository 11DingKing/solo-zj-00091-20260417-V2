import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	Col,
	Container,
	Form,
	Row,
	Spinner as BootstrapSpinner,
} from "react-bootstrap";
import { FaUserEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../../common/components/Spinner";
import Title from "../../common/components/Title";
import { getProfile, reset, updateProfile } from "../slices/profileSlice";

const ProfilePage = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		phone_number: "",
		about_me: "",
		license: "",
		gender: "Other",
		country: "KE",
		city: "",
		is_buyer: false,
		is_seller: false,
		is_agent: false,
	});

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { user } = useSelector((state) => state.auth);
	const { profile, isLoading, isError, isSuccess, message } = useSelector(
		(state) => state.profile
	);

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		dispatch(getProfile());

		return () => {
			dispatch(reset());
		};
	}, [user, navigate, dispatch]);

	useEffect(() => {
		if (profile) {
			setFormData({
				phone_number: profile.phone_number || "",
				about_me: profile.about_me || "",
				license: profile.license || "",
				gender: profile.gender || "Other",
				country: profile.country || "KE",
				city: profile.city || "",
				is_buyer: profile.is_buyer || false,
				is_seller: profile.is_seller || false,
				is_agent: profile.is_agent || false,
			});
		}
	}, [profile]);

	useEffect(() => {
		if (isError) {
			toast.error(message);
		}

		if (isSuccess && isEditing) {
			toast.success("Profile updated successfully!");
			setIsEditing(false);
		}

		dispatch(reset());
	}, [isError, isSuccess, message, isEditing, dispatch]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (user && user.username) {
			dispatch(
				updateProfile({
					username: user.username,
					profileData: formData,
				})
			);
		}
	};

	if (isLoading && !profile) {
		return <Spinner />;
	}

	return (
		<>
			<Title title="My Profile" />
			<Container className="mt-5">
				<Row className="justify-content-center">
					<Col md={8} lg={6}>
						<Card className="shadow">
							<Card.Header className="bg-primary text-white">
								<div className="d-flex justify-content-between align-items-center">
									<h4 className="mb-0">
										<FaUserEdit className="me-2" />
										My Profile
									</h4>
									{!isEditing && profile && (
										<Button
											variant="outline-light"
											size="sm"
											onClick={() => setIsEditing(true)}
										>
											Edit
										</Button>
									)}
								</div>
							</Card.Header>
							<Card.Body>
								{profile && (
									<div className="text-center mb-4">
										<img
											src={
												profile.profile_photo ||
												"/profile_default.png"
											}
											alt="Profile"
											className="rounded-circle mb-3"
											style={{
												width: "120px",
												height: "120px",
												objectFit: "cover",
											}}
										/>
										<h5>
											{profile.first_name} {profile.last_name}
										</h5>
										<p className="text-muted">@{profile.username}</p>
										<p className="text-muted">{profile.email}</p>
										{profile.top_agent && (
											<span className="badge bg-warning text-dark">
												Top Agent
											</span>
										)}
										{profile.is_agent && (
											<span className="badge bg-info ms-2">
												Agent
											</span>
										)}
									</div>
								)}

								{isEditing ? (
									<Form onSubmit={handleSubmit}>
										<Row>
											<Col md={6}>
												<Form.Group className="mb-3">
													<Form.Label>Phone Number</Form.Label>
													<Form.Control
														type="text"
														name="phone_number"
														value={formData.phone_number}
														onChange={handleChange}
													/>
												</Form.Group>
											</Col>
											<Col md={6}>
												<Form.Group className="mb-3">
													<Form.Label>Gender</Form.Label>
													<Form.Select
														name="gender"
														value={formData.gender}
														onChange={handleChange}
													>
														<option value="Male">Male</option>
														<option value="Female">
															Female
														</option>
														<option value="Other">Other</option>
													</Form.Select>
												</Form.Group>
											</Col>
										</Row>

										<Form.Group className="mb-3">
											<Form.Label>About Me</Form.Label>
											<Form.Control
												as="textarea"
												rows={3}
												name="about_me"
												value={formData.about_me}
												onChange={handleChange}
											/>
										</Form.Group>

										{profile?.is_agent && (
											<Form.Group className="mb-3">
												<Form.Label>License</Form.Label>
												<Form.Control
													type="text"
													name="license"
													value={formData.license}
													onChange={handleChange}
												/>
											</Form.Group>
										)}

										<Row>
											<Col md={6}>
												<Form.Group className="mb-3">
													<Form.Label>Country</Form.Label>
													<Form.Control
														type="text"
														name="country"
														value={formData.country}
														onChange={handleChange}
													/>
												</Form.Group>
											</Col>
											<Col md={6}>
												<Form.Group className="mb-3">
													<Form.Label>City</Form.Label>
													<Form.Control
														type="text"
														name="city"
														value={formData.city}
														onChange={handleChange}
													/>
												</Form.Group>
											</Col>
										</Row>

										<Form.Group className="mb-3">
											<Form.Check
												type="checkbox"
												name="is_buyer"
												label="I am looking to buy a property"
												checked={formData.is_buyer}
												onChange={handleChange}
											/>
											<Form.Check
												type="checkbox"
												name="is_seller"
												label="I am looking to sell a property"
												checked={formData.is_seller}
												onChange={handleChange}
											/>
											<Form.Check
												type="checkbox"
												name="is_agent"
												label="I am an agent"
												checked={formData.is_agent}
												onChange={handleChange}
											/>
										</Form.Group>

										<div className="d-flex gap-2">
											<Button
												type="submit"
												variant="primary"
												disabled={isLoading}
											>
												{isLoading ? (
													<>
														<BootstrapSpinner
															animation="border"
															size="sm"
															className="me-2"
														/>
														Saving...
													</>
												) : (
													"Save Changes"
												)}
											</Button>
											<Button
												variant="secondary"
												onClick={() => setIsEditing(false)}
											>
												Cancel
											</Button>
										</div>
									</Form>
								) : (
									profile && (
										<div>
											<hr />
											<Row className="mb-2">
												<Col sm={4} className="text-muted">
													Phone:
												</Col>
												<Col>{profile.phone_number}</Col>
											</Row>
											<Row className="mb-2">
												<Col sm={4} className="text-muted">
													Gender:
												</Col>
												<Col>{profile.gender}</Col>
											</Row>
											<Row className="mb-2">
												<Col sm={4} className="text-muted">
													About:
												</Col>
												<Col>{profile.about_me}</Col>
											</Row>
											{profile.license && (
												<Row className="mb-2">
													<Col sm={4} className="text-muted">
														License:
													</Col>
													<Col>{profile.license}</Col>
												</Row>
											)}
											<Row className="mb-2">
												<Col sm={4} className="text-muted">
													Location:
												</Col>
												<Col>
													{profile.city}, {profile.country}
												</Col>
											</Row>
											<Row className="mb-2">
												<Col sm={4} className="text-muted">
													Role:
												</Col>
												<Col>
													{profile.is_buyer && "Buyer "}
													{profile.is_seller && "Seller "}
													{profile.is_agent && "Agent"}
												</Col>
											</Row>
											{profile.rating && (
												<Row className="mb-2">
													<Col sm={4} className="text-muted">
														Rating:
													</Col>
													<Col>
														{profile.rating} (
														{profile.num_reviews} reviews)
													</Col>
												</Row>
											)}
										</div>
									)
								)}
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ProfilePage;
