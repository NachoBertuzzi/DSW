/* global cy */
describe('Login E2E', () => {
  it('abre la aplicación y muestra el login', () => {
    cy.visit('/');

    cy.contains('Iniciar Sesión').should('be.visible');
    cy.contains('Entrar').should('be.visible');
  });
});