"use client";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  IconButton,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { redirect } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import Link from "next/link";

const SignUp = () => {
  // React hook form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
    passwordRepeat: string;
  }>();
  const { user, signUp } = useAuth();
  const toast = useToast();

  const [showPass, setShowPass] = useState<boolean>(false);
  const [showPass2, setShowPass2] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState<boolean>(false);
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);

  const handleToggleShowPassword = () => setShowPass(!showPass);
  const handleToggleShowPassword2 = () => setShowPass2(!showPass2);

  const onSubmit = handleSubmit(async (validFormData) => {
    try {
      setLoading(true);
      setSignUpError(() => false);
      setSignUpSuccess(() => false);

      const { email, password } = validFormData;

      const { error } = await signUp({ email, password });

      if (error) {
        setSignUpError(() => true);
        return;
      }

      toast({
        title: "Success",
        description: "Please check your email to verify your account!",
        status: "success",
        position: "top",
      });

      setSignUpSuccess(() => true);
    } catch (error) {
      toast({
        title: "Error creating user!",
        description: "Something went wrong",
        status: "error",
        position: "top",
      });
      setSignUpError(() => true);
      setSignUpSuccess(() => false);
    } finally {
      setLoading(false);
    }
  });

  // Redirect if user is already logged in
  if (user) {
    redirect("/");
  }

  return (
    <Container
      maxW="container.sm"
      py="10"
      display="flex"
      justifyContent="center"
      alignItems="center"
      h="full"
      overflow="hidden"
    >
      <Box w="full">
        <Box
          rounded="xl"
          px="5"
          pt="12"
          flex="1"
          textAlign="center"
          shadow="xl"
          border="1px solid #acacac1c"
        >
          <Box py="5">
            <form onSubmit={onSubmit} autoComplete="off">
              <VStack spacing="4">
                {signUpError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Error creating user!</AlertTitle>
                  </Alert>
                )}
                {signUpSuccess && (
                  <Alert status="success">
                    <AlertIcon />
                    <AlertTitle>Account created!</AlertTitle>
                    <AlertDescription>
                      Please check your email to verify account
                    </AlertDescription>
                  </Alert>
                )}
                {/* Email */}
                <FormControl isInvalid={errors.email ? true : false} isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    type="email"
                    {...register("email", {
                      required: {
                        value: true,
                        message: "Email is required",
                      },
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    size="lg"
                  />
                  {errors.email && (
                    <FormErrorMessage textAlign="left">
                      {errors.email.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                {/* Password */}
                <FormControl
                  isInvalid={errors.password ? true : false}
                  isRequired
                >
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPass ? "text" : "password"}
                      {...register("password", {
                        required: {
                          value: true,
                          message: "Password is required",
                        },
                      })}
                      size="lg"
                    />
                    <InputRightElement width="5.5rem" mt="4px" mr="4px">
                      <IconButton
                        size="sm"
                        onClick={handleToggleShowPassword}
                        icon={showPass ? <FiEyeOff /> : <FiEye />}
                        aria-label="Show password"
                        title={showPass ? "Hide password" : "Show password"}
                        bg="gray.300"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <FormErrorMessage textAlign="left">
                      {errors.password.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                {/* Password Repeat*/}
                <FormControl
                  isInvalid={errors.passwordRepeat ? true : false}
                  isRequired
                >
                  <FormLabel htmlFor="passwordRepeat">
                    Repeat Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPass2 ? "text" : "password"}
                      {...register("passwordRepeat", {
                        required: true,
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match",
                      })}
                      size="lg"
                    />
                    <InputRightElement width="5.5rem" mt="4px" mr="4px">
                      <IconButton
                        size="sm"
                        onClick={handleToggleShowPassword2}
                        icon={showPass2 ? <FiEyeOff /> : <FiEye />}
                        aria-label="Show password"
                        title={showPass2 ? "Hide password" : "Show password"}
                        bg="gray.300"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.passwordRepeat && (
                    <FormErrorMessage textAlign="left">
                      {errors.passwordRepeat.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <VStack w="100%">
                  <Button
                    mt={4}
                    type="submit"
                    size="lg"
                    w="100%"
                    colorScheme="blue"
                    isLoading={loading}
                    rightIcon={<Icon as={FiArrowRight} fontSize="xl" />}
                  >
                    Sign Up
                  </Button>
                </VStack>
              </VStack>
            </form>
            {/* Link to login */}
            <HStack justify="center" mt="5">
              <Link href="/login">
                <HStack justify="center" _hover={{ textDecor: "underline" }}>
                  <Box>Already have an account?</Box>
                  <Box color="blue.300">Login</Box>
                </HStack>
              </Link>
            </HStack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
