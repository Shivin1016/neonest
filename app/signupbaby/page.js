"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Toaster, toast } from 'sonner';

export default function SignupBabyPage() {
  useEffect(() => {
    document.title = "Baby Details | NeoNest";
  }, []);

  const router = useRouter();
  const { token, user } = useAuth(); // Assuming user object contains parent's name from context

  // State for form inputs
  const [noOfBabies, setNoOfBabies] = useState(1);
  const [deliveryType, setDeliveryType] = useState("");
  const [babies, setBabies] = useState([
    { babyName: "", gender: "", dateOfBirth: "", time: "", Weight: "" },
  ]);

  // State for validation errors
  const [deliveryTypeError, setDeliveryTypeError] = useState("");
  const [babyErrors, setBabyErrors] = useState([{}]); // Array of objects, each for a baby's errors

  // State to track if inputs have been "touched"
  const [deliveryTypeTouched, setDeliveryTypeTouched] = useState(false);
  // Array of booleans to track if any field in a baby's section has been touched
  const [babiesTouched, setBabiesTouched] = useState([false]);


  // Initialize babyErrors and babiesTouched arrays when noOfBabies changes
  // This ensures we have enough error/touched states for all baby forms
  useEffect(() => {
    setBabyErrors(
      Array.from({ length: noOfBabies }, (_, i) => babyErrors[i] || {})
    );
    setBabiesTouched(
      Array.from({ length: noOfBabies }, (_, i) => babiesTouched[i] || false)
    );
  }, [noOfBabies]);


  // --- Validation Functions ---
  const validateDeliveryType = (value) => {
    if (!value) {
      setDeliveryTypeError("Delivery type is required.");
      return false;
    }
    setDeliveryTypeError("");
    return true;
  };

  const validateBaby = (baby, index, updateErrors = true) => {
    let currentBabyErrors = {};
    let isValid = true;

    if (!baby.babyName.trim()) {
      currentBabyErrors.babyName = "Name is required.";
      isValid = false;
    }
    if (!baby.dateOfBirth) {
      currentBabyErrors.dateOfBirth = "Date of birth is required.";
      isValid = false;
    }
    if (!baby.time) {
      currentBabyErrors.time = "Time of birth is required.";
      isValid = false;
    }
    if (!baby.gender) {
      currentBabyErrors.gender = "Gender is required.";
      isValid = false;
    }

    if (updateErrors) {
      // Update the specific baby's error object in the state
      setBabyErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index] = currentBabyErrors;
        return newErrors;
      });
    }

    return isValid;
  };

  // --- Change Handlers ---
  const handleNoOfBabiesChange = (e) => {
    const count = parseInt(e.target.value);
    setNoOfBabies(count);
    setBabies((prev) =>
      Array.from(
        { length: count },
        (_, i) =>
          prev[i] || {
            babyName: "",
            gender: "",
            dateOfBirth: "",
            time: "",
            Weight: "",
          }
      )
    );
    // When changing baby count, reset touched and errors for new/re-indexed babies
    setBabyErrors(Array.from({ length: count }, () => ({})));
    setBabiesTouched(Array.from({ length: count }, () => false));
    setDeliveryTypeTouched(false); // Reset delivery type touched as form structure changes
  };

  const handleDeliveryTypeChange = (e) => {
    const value = e.target.value;
    setDeliveryType(value);
    validateDeliveryType(value); // Validate on change
  };

  const handleBabyChange = (index, field, value) => {
    const updatedBabies = [...babies];
    updatedBabies[index][field] = value;
    setBabies(updatedBabies);
    validateBaby(updatedBabies[index], index); // Validate updated baby on change
  };

  // --- onBlur Handlers ---
  const handleDeliveryTypeBlur = () => setDeliveryTypeTouched(true);
  const handleBabyBlur = (index) => {
    setBabiesTouched((prev) => {
      const newTouched = [...prev];
      newTouched[index] = true;
      return newTouched;
    });
  };

  // --- Form Validity Check (for button state) ---
  const isFormValid = useMemo(() => {
    // Check general inputs for validity
    const deliveryTypeIsValid = validateDeliveryType(deliveryType);
    if (!deliveryTypeIsValid) return false;

    // Check all baby inputs for validity
    const allBabiesAreValid = babies.every((baby, index) =>
      validateBaby(baby, index, false) // Pass false to not update state during memo recalculation
    );

    return allBabiesAreValid;
  }, [deliveryType, babies]); // Re-evaluate when these states change


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched on submit attempt
    setDeliveryTypeTouched(true);
    setBabiesTouched(Array.from({ length: noOfBabies }, () => true)); // Mark all babies as touched

    // Perform final client-side validation
    const deliveryTypeIsValid = validateDeliveryType(deliveryType);
    const allBabiesAreValid = babies.every((baby, index) => validateBaby(baby, index)); // Update errors on final validation

    if (!deliveryTypeIsValid || !allBabiesAreValid) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    try {
      // Correct way to send JSON data (as discussed in previous interactions)
      const payload = {
        noOfBabies: noOfBabies,
        deliveryType: deliveryType,
        BabyDet: babies, // Send the array directly
      };

      const res = await axios.put(
        "/api/auth/signup",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;

      if (res.status === 200) {
        console.log("Signup Baby Success:", data);
        toast.success(data.success);

        // Store parent's name in session storage for welcome message on homepage
        // Prioritize name from updatedUser, then from existing user context, fallback to "Parent"
        const parentName = data.updatedUser?.name || user?.name || "Parent";
        sessionStorage.setItem('showWelcomeToast', 'true');
        sessionStorage.setItem('parentName', parentName);

        router.push(`/`); // Navigate to homepage
      } else {
        // This 'else' block might be redundant if axios always throws for non-2xx statuses
        toast.error(data.error || "An unexpected error occurred.");
      }
    } catch (err) {
      console.error("Signup Baby error:", err);
      if (axios.isAxiosError(err) && err.response) {
        const backendError = err.response.data.error;
        toast.error(backendError || "An unexpected error occurred from server.");

        // Attempt to map backend errors to specific fields for inline display
        // Mark fields as touched to ensure errors become visible
        if (backendError.includes("Please provide all details")) {
          // This broad backend error might imply missing deliveryType
          setDeliveryTypeError("Delivery type is required.");
          setDeliveryTypeTouched(true);
        }
        if (backendError.includes("Please provide all baby details")) {
          // This implies one or more baby details are missing/invalid
          // Re-validate all babies to populate client-side errors
          babies.forEach((baby, index) => validateBaby(baby, index));
          setBabiesTouched(Array.from({ length: noOfBabies }, () => true)); // Mark all babies fields as touched
        }
      } else {
        toast.error("Network error or unexpected problem.");
      }
    }
  };

  return (
    <>
      <Toaster richColors />
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-100 to-purple-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl"
        >
          <h1 className="text-2xl font-bold mb-1 text-center text-purple-600">
            Baby Details
          </h1>
          <h2 className="text-md text-center text-gray-500 mb-4">
            Kindly fill the below details!
          </h2>

          {/* General Info */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">
              Number of babies at birth
            </label>
            <select
              value={noOfBabies}
              onChange={handleNoOfBabiesChange}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value={1}>1 (Single)</option>
              <option value={2}>2 (Twins)</option>
              <option value={3}>3 (Triplets)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-1 block">
              Type of Delivery
            </label>
            <select
              value={deliveryType}
              onChange={handleDeliveryTypeChange}
              onBlur={handleDeliveryTypeBlur}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${(deliveryTypeError && deliveryTypeTouched) ? 'border-red-500 focus:ring-red-400' : 'border-purple-300 focus:ring-purple-400'}
              `}
            >
              <option value="">Select Delivery Type</option>
              <option value="Normal">Normal</option>
              <option value="C-Section">C-Section</option>
              <option value="Assisted">Assisted</option>
            </select>
            {(deliveryTypeError && deliveryTypeTouched) && <p className="text-red-500 text-sm mt-1">{deliveryTypeError}</p>}
          </div>

          {babies.map((baby, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50"
            >
              <h3 className="font-semibold text-purple-700 mb-2">
                Baby {index + 1}
              </h3>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Baby's Name"
                  value={baby.babyName}
                  onChange={(e) => handleBabyChange(index, "babyName", e.target.value)}
                  onBlur={() => handleBabyBlur(index)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${(babyErrors[index]?.babyName && babiesTouched[index]) ? 'border-red-500 focus:ring-red-400' : 'border-purple-300 focus:ring-purple-400'}
                  `}
                />
                {(babyErrors[index]?.babyName && babiesTouched[index]) && <p className="text-red-500 text-sm mt-1">{babyErrors[index].babyName}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="date"
                  value={baby.dateOfBirth}
                  onChange={(e) => handleBabyChange(index, "dateOfBirth", e.target.value)}
                  onBlur={() => handleBabyBlur(index)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${(babyErrors[index]?.dateOfBirth && babiesTouched[index]) ? 'border-red-500 focus:ring-red-400' : 'border-purple-300 focus:ring-purple-400'}
                  `}
                />
                {(babyErrors[index]?.dateOfBirth && babiesTouched[index]) && <p className="text-red-500 text-sm mt-1">{babyErrors[index].dateOfBirth}</p>}
              </div>

              <div className="mb-3">
                <input
                  type="time"
                  value={baby.time}
                  onChange={(e) => handleBabyChange(index, "time", e.target.value)}
                  onBlur={() => handleBabyBlur(index)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${(babyErrors[index]?.time && babiesTouched[index]) ? 'border-red-500 focus:ring-red-400' : 'border-purple-300 focus:ring-purple-400'}
                  `}
                />
                {(babyErrors[index]?.time && babiesTouched[index]) && <p className="text-red-500 text-sm mt-1">{babyErrors[index].time}</p>}
              </div>

              <div className="mb-3">
                <select
                  value={baby.gender}
                  onChange={(e) => handleBabyChange(index, "gender", e.target.value)}
                  onBlur={() => handleBabyBlur(index)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${(babyErrors[index]?.gender && babiesTouched[index]) ? 'border-red-500 focus:ring-red-400' : 'border-purple-300 focus:ring-purple-400'}
                  `}
                >
                  <option value="">Select Gender</option>
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                  <option value="Other">Other</option>
                </select>
                {(babyErrors[index]?.gender && babiesTouched[index]) && <p className="text-red-500 text-sm mt-1">{babyErrors[index].gender}</p>}
              </div>

              <input
                type="number"
                value={baby.Weight}
                onChange={(e) => handleBabyChange(index, "Weight", e.target.value)}
                placeholder="Weight at birth (kg) - optional"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {/* No error message for optional Weight field */}
            </div>
          ))}

          <p className="text-center text-sm text-gray-500 mb-4">
            At NeoNest, your data privacy is paramount. We are committed to
            keeping your information confidential and do not share it with third
            parties.
          </p>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded-lg font-semibold transition-transform
              ${isFormValid
                ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Complete Signup
          </button>
        </form>
      </div>
    </>
  );
}
