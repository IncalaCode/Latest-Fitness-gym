/**
 * Adapter to convert Zod schemas to Formik validation schemas
 * This allows us to define our validation rules once with Zod
 * and use them with Formik's validation system
 */

export const toFormikValidationSchema = (zodSchema) => {
  return {
    validate: async (values) => {
      try {
        await zodSchema.parseAsync(values);
        return {};
      } catch (error) {
        return error.errors.reduce((formikErrors, currentError) => {
          const path = currentError.path.join('.');
          if (!formikErrors[path]) {
            formikErrors[path] = currentError.message;
          }
          return formikErrors;
        }, {});
      }
    }
  };
};