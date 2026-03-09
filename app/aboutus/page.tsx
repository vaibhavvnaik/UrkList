import Container from "../components/Container";

const AboutUsPage = () => {
  return (
    <div className="fixed w-full bg-white z-10 shadow-sm">
      <div className="py-2 border-b-[1px]">
        <Container>
          <div
            className="
              flex
              flex-row
              items-center
              justify-between
              gap-3
              md:gap-0
            "
          >
            <div>
              <a href="/terms.html">Terms</a>
            </div>
            <div>
              <a href="/privacy.html">Privacy Policy</a>
            </div>
            <div>
              <a href="/cookies.html">Cookies</a>
            </div>
            <div>
              <a href="/disclaimer.html">Disclaimer</a>
            </div>
            <div>
              <a href="/contact.html">Contact Us</a>
            </div>
          </div>
        </Container>
      </div>
      <hr />
    </div>
  );
};

export default AboutUsPage;
